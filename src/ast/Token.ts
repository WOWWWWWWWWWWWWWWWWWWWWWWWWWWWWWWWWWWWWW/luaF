import { Context } from "@utils/Context"

export enum TokenType {
	Eof,
	String,
	Keyword,
	Ident,
	Number,
	Symbol
}

const BlockFollowKeyword = new Set(["else", "elseif", "until", "end"])

const UnopSet = new Set(["-", "not", "#"])
const BinopSet = new Set([
	"+",
	"-",
	"*",
	"/",
	"%",
	"^",
	"#",
	"..",
	".",
	":",
	">",
	"<",
	"<=",
	">=",
	"~=",
	"==",
	"and",
	"or"
])

const rev = Object.keys(TokenType)
export class Token {
	type: TokenType
	source: string

	constructor(type: TokenType, source: string) {
		this.type = type
		this.source = source
	}

	public toString(): string {
		return `<${this.readableType()} \`${this.source}\`>`
	}

	private readableType() {
		return rev[this.type]
	}
}

export class StreamedToken extends Token {
	leadingWhite: string
	comments: string[]

	constructor(
		type: TokenType,
		source: string,
		leadingWhite: string,
		comments: string[]
	) {
		super(type, source)
		this.leadingWhite = leadingWhite
		this.comments = comments
	}

	public isBlockFollow(): boolean {
		return (
			this.type == TokenType.Eof ||
			(this.type == TokenType.Keyword && BlockFollowKeyword.has(this.source))
		)
	}

	public isBinop(): boolean {
		return BinopSet.has(this.source)
	}

	public isUnop(): boolean {
		return UnopSet.has(this.source)
	}

	checkAnnotations(context: Context): StreamedToken {
		for (const comment of this.comments) {
			let matched
			for (const match of comment.matchAll(
				/\s*?(\/{1,3})\s*?luaf\s*\/{0,3}\s+(\w+)\s+([^/]+)/g
			)) {
				matched = true
				const scope = match[1].length
				const subcmd = match[2]
				const args = match[3]

				const method = context[subcmd]
				if (method instanceof Function) {
					method.call(context, scope, args)
				} else {
					console.warn(
						`Invalid subcommand \`${subcmd}\` in annotation \`${comment}\`, ignoring`
					)
				}
			}

			if (comment.includes("luaf") && !matched) {
				console.warn(
					`Incorrect syntax detected in annotation \`${comment}\`, ignoring`
				)
			}
		}
		return this
	}

	strip(): Token {
		return new Token(this.type, this.source)
	}
}

export type TokenTree = Token | TokenTree[]
