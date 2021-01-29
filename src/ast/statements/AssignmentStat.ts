import { assembleWithCommas, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class AssignmentStat extends Statement {
	constructor(
		options: Options,
		public lhs: Expression[],
		public rhs: Expression[]
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			assembleWithCommas(this.lhs),
			new Token(TokenType.Symbol, "="),
			assembleWithCommas(this.rhs)
		]
	}
}
