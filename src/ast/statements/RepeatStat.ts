import { Block, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class RepeatStat extends Statement {
	body: Block
	condition: Expression

	constructor(options: Options, body: Block, condition: Expression) {
		super(options)
		this.body = body
		this.condition = condition
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