import { Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class BreakStat extends Statement {
	constructor(options: Options) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [new Token(TokenType.Keyword, "break")]
	}
}
