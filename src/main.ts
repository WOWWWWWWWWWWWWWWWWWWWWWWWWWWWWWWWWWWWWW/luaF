import { cac } from 'https://unpkg.com/cac/mod.ts';
import parse from "./parser/index.ts";
import lexer from "./parser/lexer.ts";

const cli = cac('luaf');

cli.command('dump <input>', 'Dumps the token stream for a file. (DEBUGGING)')
    .option('-o <output>', 'Output file')
    .action(async (input, options) => {
        let text = await Deno.readTextFile(input);
        await Deno.writeTextFile(options.o || "dump.json", JSON.stringify(lexer(text), null, 4));
    })

cli.help()
cli.parse()