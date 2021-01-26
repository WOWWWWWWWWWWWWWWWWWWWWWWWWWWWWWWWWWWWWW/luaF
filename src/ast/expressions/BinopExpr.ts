import { Expression } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"

export class BinopExpr extends Expression {
	lhs: Expression
	op: Token
	rhs: Expression

	constructor(lhs: Expression, op: Token, rhs: Expression) {
		super()
		this.lhs = lhs
		this.op = op
		this.rhs = rhs
	}

	assemble(): TokenTree[] {
		return [this.lhs.assemble(), this.op, this.rhs.assemble()]
	}
}
