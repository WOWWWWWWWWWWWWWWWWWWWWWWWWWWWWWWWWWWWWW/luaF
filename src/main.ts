import { cac } from 'https://unpkg.com/cac/mod.ts';
import { parse } from "./parser/index.ts";
import { lexer } from "./parser/lexer.ts";

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

cli.help()
cli.parse()