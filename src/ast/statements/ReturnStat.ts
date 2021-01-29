import { assembleWithCommas, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { TokenTree, Token, TokenType } from "@ast/Token"

export class ReturnStat extends Statement {
	constructor(options: Options, public list: Expression[]) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "return"),
			assembleWithCommas(this.list)
		]
	}
}
