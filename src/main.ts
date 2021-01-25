import { cac } from 'https://unpkg.com/cac/mod.ts';
import { parse } from "./parser/index.ts";
import { lexer } from "./parser/lexer.ts";
import { Block } from "./parser/types/Base.ts";
import { print } from "./print.ts";

import { createVariableInfo } from "./variableInfo/index.ts";
import { Scope } from "./variableInfo/Scope.ts";
import { Global } from "./variableInfo/Variable.ts";

import transformers from "./transformers/general/index.ts";

const cli = cac('luaf');
const __dirname = new URL('.', import.meta.url).pathname.slice(1);

const exists = async (filename: string): Promise<boolean> => {
    try {
        await Deno.stat(filename);
        // successful, file or directory must exist
        return true;
    } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
            // file or directory does not exist
            return false;
        } else {
            // unexpected error, maybe permissions, pass it along
            throw error;
        }
    }
};

//---

declare global {
    interface Array<T> {
        shuffle(): Array<T>;
    }

    interface String {
        mock(): string
    }
}

Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this
}

// Random upper and lowercase
String.prototype.mock = function () {
    return this.split("").map(c => Math.random() < .5 ? c.toLowerCase() : c.toUpperCase()).join("")
}

//---


cli.command('dumpts <input>', 'Dumps the token stream for a file. (DEBUGGING)')
    .option('-o <output>', 'Output file')
    .action(async (input, options) => {
        const text = await Deno.readTextFile(input);
        await Deno.writeTextFile(options.o || "dumpts.json", JSON.stringify(lexer(text), null, 4));
    })

cli.command('dumptt <input>', 'Dumps the token tree for a file. (DEBUGGING)')
    .option('-o <output>', 'Output file')
    .action(async (input, options) => {
        const text = await Deno.readTextFile(input);
        await Deno.writeTextFile(options.o || "dumptt.json", JSON.stringify(parse(text).assemble(), null, 4));
    })

cli.command('build <input>', 'Builds the file with luaF')
    .option('-o <output>', 'Output file')
    .action(async (input, options) => {
        const text = await Deno.readTextFile(input);
        let root = parse(text)

        // Normal transformers
        for (const transform of transformers) {
            root = transform(root)
        }

        // transformers that require variableInfo
        const [globals, rootScope] = createVariableInfo(root)
        const vtransformerDir = await Deno.readDir(await Deno.realPath(__dirname + "/transformers/variable"));
        for await (const vtransformer of vtransformerDir) {
            let path;
            if (vtransformer.isFile && vtransformer.name.endsWith('.ts')) {
                path = await Deno.realPath(__dirname + "/transformers/variable/" + vtransformer.name);
                console.log(`Doing variable transformer ${vtransformer.name.slice(0, -3)}`)
            } else if (vtransformer.isDirectory) {
                path = await Deno.realPath(__dirname + "/transformers/variable/" + vtransformer.name + "/index.ts");
                console.log(`Doing variable transformer ${vtransformer.name}`)
            }

            if (path && await exists(path)) {
                const transform: (root: Block, globals: Global[], rootScope: Scope) => Block = (await import("file://" + path)).default;
                root = transform(root, globals, rootScope)
            } else {
                throw Error("Transformer does not exist.")
            }
        }

        await Deno.writeTextFile(options.o || "out.lua", print(root));
    })

cli.help()
cli.parse()