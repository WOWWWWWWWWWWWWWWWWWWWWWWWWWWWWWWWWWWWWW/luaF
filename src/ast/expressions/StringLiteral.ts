import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"
import {
	CharacterForEscape,
	EscapeForCharacter,
	LookbehindEvenBackslashes
} from "@utils/constants"

export class StringLiteral extends Expression {
	constructor(public value: string, public openingQuote: string) {
		super()
	}

	static fromToken(token: Token): StringLiteral {
		const openingQuote = token.source.match(/'|"|\[=*\[/)?.[0]
		if (!openingQuote)
			throw new Error(
				`Invalid string \`${token.source}\` in StringLiteral.fromToken`
			)

		// Replace foldable ascii escapes
		const src = token.source
			// Closing quote is always the same length as opening quote
			.slice(openingQuote.length, -openingQuote.length)
			.replace(
				new RegExp(
					`${LookbehindEvenBackslashes.source}${/\\(\d{1,3})/.source}`,
					"g"
				),
				(_, n: string) =>
					//n > 31 && n < 127 ?
					String.fromCharCode(parseInt(n)) // : w
			)
			.replace(
				new RegExp(
					`${LookbehindEvenBackslashes.source}${/\\([rnt"'\\])/.source}`,
					"g"
				),
				(_, n: string) => CharacterForEscape[n] || _
			)

		return new StringLiteral(src, openingQuote)
	}

	formatValue(): string {
		return (
			this.value
				.replace(/[\r\n\t\\]/g, (c) => EscapeForCharacter[c] || c) // Other escapes
				// eslint-disable-next-line no-control-regex
				.replace(/[\0-\x1F\x7F-\xFF]/g, (c) => `\\${c.charCodeAt(0)}`) // Change ascii escapes back
				.replace(new RegExp(this.openingQuote, "g"), `\\${this.openingQuote}`)
		) // Escape quote
	}

	toToken(): Token {
		return new Token(
			TokenType.String,
			this.openingQuote + this.formatValue() + this.getClosingQuote()
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
