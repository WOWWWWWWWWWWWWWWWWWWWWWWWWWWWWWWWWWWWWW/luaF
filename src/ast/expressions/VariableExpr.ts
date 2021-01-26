import { Expression } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"

export class VariableExpr extends Expression {
	value: Token

	constructor(value: Token) {
		super()
		this.value = value
	}

	assemble(): TokenTree[] {
		return [this.value]
	}
}
