import { Expression } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"

export class UnopExpr extends Expression {
	constructor(public op: Token, public base: Expression) {
		super()
	}

	assemble(): TokenTree[] {
		return [this.op, this.base.assemble()]
	}
}
