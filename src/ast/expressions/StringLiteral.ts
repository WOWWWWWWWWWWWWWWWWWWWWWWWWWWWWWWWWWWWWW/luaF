import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class StringLiteral extends Expression {
	value: string
	openingQuote: string

	constructor(value: string, openingQuote: string) {
		super()
		this.value = value
		this.openingQuote = openingQuote
	}

	static fromToken(token: Token): StringLiteral {
		const openingQuote = token.source.match(/'|"|\[=*\[/)?.[0]
		if (!openingQuote)
			throw new Error(
				`Invalid string \`${token.source}\` in StringLiteral.fromToken`
			)

		// Closing quote is always the same length as opening quote
		return new StringLiteral(
			token.source.slice(openingQuote.length, -openingQuote.length),
			openingQuote
		)
	}

	toToken(): Token {
		return new Token(
			TokenType.String,
			this.openingQuote + this.value + this.getClosingQuote()
		)
	}

	getClosingQuote(): string {
		// All we really need to replace is the direction of the brackets
		return this.openingQuote.replace(/\[/g, "]")
	}

	assemble(): TokenTree[] {
		return [this.toToken()]
	}
}
