import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class FieldExpr extends Expression {
	base: Expression
	field: Token

	constructor(base: Expression, field: Token) {
		super()
		this.base = base
		this.field = field
	}

	assemble(): TokenTree[] {
		return [this.base.assemble(), new Token(TokenType.Symbol, "."), this.field]
	}
}
