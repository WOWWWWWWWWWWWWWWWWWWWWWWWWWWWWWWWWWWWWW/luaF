import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class IndexExpr extends Expression {
	constructor(public base: Expression, public index: Expression) {
		super()
	}

	assemble(): TokenTree[] {
		return [
			this.base.assemble(),
			new Token(TokenType.Symbol, "["),
			this.index.assemble(),
			new Token(TokenType.Symbol, "]")
		]
	}
}
