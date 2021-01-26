import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class ParenExpr extends Expression {
	value: Expression

	constructor(value: Expression) {
		super()
		this.value = value
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Symbol, "("),
			this.value.assemble(),
			new Token(TokenType.Symbol, ")")
		]
	}
}
