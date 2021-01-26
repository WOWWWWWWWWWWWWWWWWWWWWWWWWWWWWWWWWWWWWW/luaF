import { cac } from 'https://unpkg.com/cac/mod.ts';
import { parse } from "./parser/index.ts";
import { lexer } from "./parser/lexer.ts";
import { print } from "./print.ts";

import { createVariableInfo } from "./variableInfo/index.ts";

import transformers from "./transformers/general/index.ts";
import vtransformers from "./transformers/variable/index.ts";

const cli = cac('luaf');

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

        // Variable transformers
        for (const transform of vtransformers) {
            root = transform(root, globals, rootScope)
        }

        await Deno.writeTextFile(options.o || "out.lua", print(root));
    })

cli.help()
cli.parse()