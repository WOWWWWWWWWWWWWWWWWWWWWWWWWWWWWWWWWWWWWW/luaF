import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class BooleanLiteral extends Expression {
	constructor(public value: boolean) {
		super()
	}

	assemble(): TokenTree[] {
		return [new Token(TokenType.Keyword, this.value ? "true" : "false")]
	}
}
