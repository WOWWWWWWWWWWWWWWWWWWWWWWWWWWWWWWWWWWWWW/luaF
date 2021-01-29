import { Block, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class DoStat extends Statement {
	constructor(options: Options, public body: Block) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "do"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}
