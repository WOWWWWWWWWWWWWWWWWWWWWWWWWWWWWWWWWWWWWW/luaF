const { cac } = require("cac")
const { readdir, stat, readFile, writeFile } = require("fs/promises")
const { join, resolve, relative } = require("path")

const cli = cac("import-expand")

cli.command("<directory>").action(async (directory) => {
	async function doFile(filedir, file) {
		let contents = await readFile(file, { encoding: "utf-8" })
		contents = contents.replace(
			/import(\s+(?:.+?\s+from\s+)?)("|')@(.+?)("|')/g,
			(i, details, openingQuote, pathWithoutAt, closingQuote) => {
				const rel = relative(filedir, directory) // ../ from file directory to root
				let newPath = join(rel, pathWithoutAt).replace(/\\/g, "/") // replace backslash with forward slash

				// join omits ./ when importing from current directory, we must add it
				if (!newPath.startsWith(".")) newPath = "./" + newPath

				return `import${details}${openingQuote}${newPath}${closingQuote}`
			}
		)

		await writeFile(file, contents, { encoding: "utf-8" })
	}

	async function doDirectory(dir) {
		const files = await readdir(resolve(dir), {
			withFileTypes: true
		})

		for (const file of files) {
			const path = join(dir, file.name)
			if (file.name.endsWith(".js")) {
				doFile(dir, path)
			} else if (file.isDirectory()) {
				await doDirectory(path)
			}
		}
	}

	await doDirectory(directory)
})

cli.help()
cli.parse()
