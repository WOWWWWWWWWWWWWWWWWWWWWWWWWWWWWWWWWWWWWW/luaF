import { Block, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class DoStat extends Statement {
	body: Block

	constructor(options: Options, body: Block) {
		super(options)
		this.body = body
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "do"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}
