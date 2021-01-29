import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class NumberLiteral extends Expression {
	constructor(public value: number) {
		super()
	}

	static fromToken(token: Token): NumberLiteral {
		return new NumberLiteral(parseFloat(token.source))
	}

	toToken(): Token {
		return new Token(
			TokenType.Number,
			this.value.toString().replace(/^0\./, ".")
		)
	}

	assemble(): TokenTree[] {
		return [this.toToken()]
	}
}
