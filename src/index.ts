import { cac } from "cac"
import { readFile, writeFile } from "fs/promises"

import { parse } from "@parser"
import { lexer } from "@parser/lexer"
import { print } from "./print"

import transformers from "@transformers"

const cli = cac("luaf")

cli
	.command("dumpts <input>", "Dumps the token stream for a file. (DEBUGGING)")
	.option("-o <output>", "Output file")
	.action(async (input, options) => {
		const text = await readFile(input, { encoding: "utf-8" })
		await writeFile(
			options.o || "dumpts.json",
			JSON.stringify(lexer(text), null, 4),
			{ encoding: "utf-8" }
		)
	})

cli
	.command("dumptt <input>", "Dumps the token tree for a file. (DEBUGGING)")
	.option("-o <output>", "Output file")
	.action(async (input, options) => {
		const text = await readFile(input, { encoding: "utf-8" })
		await writeFile(
			options.o || "dumptt.json",
			JSON.stringify(parse(text).assemble(), null, 4),
			{ encoding: "utf-8" }
		)
	})

cli
	.command("build <input>", "Builds the file with luaF")
	.option("-o <output>", "Output file")
	.action(async (input, options) => {
		const text = await readFile(input, { encoding: "utf-8" })
		let root = parse(text)

		// Normal transformers
		console.log("Doing transforms.")
		for (const transform of transformers) {
			root = transform(root)
		}

		console.log("Done.")

		await writeFile(options.o || "out.lua", print(root), { encoding: "utf-8" })
	})

cli.help()
cli.parse()
