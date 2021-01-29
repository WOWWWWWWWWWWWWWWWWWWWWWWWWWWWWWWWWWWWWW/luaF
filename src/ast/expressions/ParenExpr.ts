import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class ParenExpr extends Expression {
	constructor(public value: Expression) {
		super()
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Symbol, "("),
			this.value.assemble(),
			new Token(TokenType.Symbol, ")")
		]
	}
}
