import { assembleWithCommas, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { TokenTree, Token, TokenType } from "@ast/Token"

export class ReturnStat extends Statement {
	list: Expression[]

	constructor(options: Options, list: Expression[]) {
		super(options)
		this.list = list
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "return"),
			assembleWithCommas(this.list)
		]
	}
}
