import { Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class VargLiteral extends Expression {
	assemble(): TokenTree[] {
		return [new Token(TokenType.Symbol, "...")]
	}
}
