import { assembleTokensWithCommas, Block, Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class FunctionLiteral extends Expression {
	constructor(public arglist: Token[], public body: Block) {
		super()
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "function"),
			new Token(TokenType.Symbol, "("),
			assembleTokensWithCommas(this.arglist),
			new Token(TokenType.Symbol, ")"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}
