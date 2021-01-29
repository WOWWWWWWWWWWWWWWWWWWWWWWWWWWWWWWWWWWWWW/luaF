import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class FieldExpr extends Expression {
	constructor(public base: Expression, public field: Token) {
		super()
	}

	assemble(): TokenTree[] {
		return [this.base.assemble(), new Token(TokenType.Symbol, "."), this.field]
	}
}
