import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class BooleanLiteral extends Expression {
	value: boolean

	constructor(value: boolean) {
		super()
		this.value = value
	}

	assemble(): TokenTree[] {
		return [new Token(TokenType.Keyword, this.value ? "true" : "false")]
	}
}
