import { deepCopy } from "@utils/deepCopy"

export interface Option {
	enabled: boolean
}

export class Options {
	[setting: string]: Option | undefined
	identifierRenaming = {
		enabled: false,
		mode: "alphabet",
		prefix: "",
		renameGlobals: false,
		increment: false
	}

	tweakNumberNotation = {
		enabled: false,
		hex: true,
		exponent: true
	}

	/*
        removeDuplicateLiterals = {
            enabled: false
        }
    */

	variableGrouping = {
		enabled: false
	}

	dotToBracketNotation = {
		enabled: false
	}

	stringToArgCall = {
		enabled: false
	}

	encodeStrings = {
		enabled: false
	}

	splitStrings = {
		enabled: false,
		freq: 0.5,

		min: 2, // minimum chunk size
		max: 3 // maximum chunk size
	}

	nilDeadEnd = {
		enabled: false
	}

	charToTernary = {
		enabled: false,
		freq: 0.5,
		cycleProbability: 0.2
	}

	globalToEnv = {
		enabled: false
	}

	functionToAssignment = {
		enabled: false
	}

	expandInvoke = {
		enabled: false
	}

	addParenthesis = {
		enabled: false
	}
}

// get defaults as array
const Settings = Object.getOwnPropertyNames(new Options())

enum Scope {
	Global = 1,
	Block,
	Statement
}

function parseSubcommand(cmd: string): string[][] {
	const check = [...cmd.matchAll(/\s*(\w+|\*)\s*({.+})?\s*(?:,|$)/gy)]
	if (cmd.split(",").length < check.length) {
		console.warn(
			`Was only able to parse ${check.length} commands in this annotation:\n${cmd}`
		)
	}
	return check
}

export class Context {
	[index: string]: Options | ((scope: number, cmd: string) => void)
	global: Options
	block: Options
	statement: Options

	constructor() {
		this.global = new Options()
		this.block = new Options()
		this.statement = new Options()
	}

	private getScopes(scope: number): Options[] {
		const res = []

		if (scope == Scope.Global) {
			res.push(this.global)
		}

		if (scope <= Scope.Block) {
			res.push(this.block)
		}

		if (scope <= Scope.Statement) {
			res.push(this.statement)
		}

		return res
	}

	enable(scope: number, cmd: string): void {
		const scopes = this.getScopes(scope)

		for (const effects of parseSubcommand(cmd)) {
			const options = effects[2] && JSON.parse(effects[2])
			let props
			if (effects[1] == "*") {
				props = Settings
			} else if (Settings.includes(effects[1])) {
				props = [effects[1]]
			} else {
				throw Error(`Obfuscation setting \`${effects[1]}\` does not exist.`)
			}

			for (const scope of scopes) {
				for (const prop of props) {
					console.log(prop, options)
					scope[prop] = {
						...scope[prop],
						...(options || {}),
						...{ enabled: true }
					}
				}
			}
		}
	}

	set(scope: number, cmd: string): void {
		const scopes = this.getScopes(scope)

		for (const effects of parseSubcommand(cmd)) {
			const options = effects[2] && JSON.parse(effects[2])
			if (!options)
				throw new Error(
					`No options provided for \`${effects[1]}\` in set subcommand`
				)

			let props
			if (effects[1] == "*") {
				props = Settings
			} else if (Settings.includes(effects[1])) {
				props = [effects[1]]
			} else {
				throw Error(`Obfuscation setting \`${effects[1]}\` does not exist.`)
			}

			for (const scope of scopes) {
				for (const prop of props) {
					console.log(prop, options)
					scope[prop] = {
						...scope[prop],
						...(options || {})
					}
				}
			}
		}
	}

	disable(scope: number, cmd: string): void {
		const scopes = this.getScopes(scope)

		for (const effects of parseSubcommand(cmd)) {
			const options = effects[2] && JSON.parse(effects[2])
			let props
			if (effects[1] == "*") {
				props = Settings
			} else if (Settings.includes(effects[1])) {
				props = [effects[1]]
			} else {
				throw Error(`Obfuscation setting \`${effects[1]}\` does not exist.`)
			}

			for (const scope of scopes) {
				for (const prop of props) {
					console.log(prop, options)
					scope[prop] = {
						...scope[prop],
						...(options || {}),
						...{ enabled: false }
					}
				}
			}
		}
	}

	pushBlock(): () => Options {
		// Used to create a new nested block option, and return the old one with new global props
		const pushed = this.block
		this.block = deepCopy(this.statement)
		return (): Options => {
			const popped = this.block
			this.block = { ...pushed, ...this.global }
			return popped
		}
	}

	resetStatement(): Options {
		const old = this.statement
		this.statement = deepCopy(this.block)
		return old
	}
}
