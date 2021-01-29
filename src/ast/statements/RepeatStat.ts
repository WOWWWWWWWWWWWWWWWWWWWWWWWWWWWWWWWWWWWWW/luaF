import { Block, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class RepeatStat extends Statement {
	constructor(
		options: Options,
		public body: Block,
		public condition: Expression
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "repeat"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "until"),
			this.condition.assemble()
		]
	}
}
