import { Expression } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"

export class BinopExpr extends Expression {
	constructor(
		public lhs: Expression,
		public op: Token,
		public rhs: Expression
	) {
		super()
	}

	assemble(): TokenTree[] {
		return [this.lhs.assemble(), this.op, this.rhs.assemble()]
	}
}
