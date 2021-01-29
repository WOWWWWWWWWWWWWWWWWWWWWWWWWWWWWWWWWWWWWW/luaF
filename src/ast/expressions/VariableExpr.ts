import { Expression } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"
import { Variable } from "@variableInfo/Variable"

export class VariableExpr extends Expression {
	variable?: Variable

	constructor(public value: Token) {
		super()
	}

	assemble(): TokenTree[] {
		return [this.value]
	}
}
