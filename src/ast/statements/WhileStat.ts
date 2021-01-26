import { Block, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class WhileStat extends Statement {
	condition: Expression
	body: Block

	constructor(options: Options, condition: Expression, body: Block) {
		super(options)
		this.condition = condition
		this.body = body
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
