import { Expression } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"
import { Variable } from "@variableInfo/Variable"

export class VariableExpr extends Expression {
	value: Token
	variable?: Variable

	constructor(value: Token) {
		super()
		this.value = value
	}

	assemble(): TokenTree[] {
		return [this.value]
	}
}
