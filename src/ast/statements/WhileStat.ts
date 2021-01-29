import { Block, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class WhileStat extends Statement {
	constructor(
		options: Options,
		public condition: Expression,
		public body: Block
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "while"),
			this.condition.assemble(),
			new Token(TokenType.Keyword, "do"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}
