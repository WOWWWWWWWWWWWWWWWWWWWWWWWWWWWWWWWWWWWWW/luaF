import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class IndexExpr extends Expression {
	base: Expression
	index: Expression

	constructor(base: Expression, index: Expression) {
		super()
		this.base = base
		this.index = index
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
