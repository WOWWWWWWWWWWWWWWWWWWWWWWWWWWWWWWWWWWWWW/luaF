import { assembleWithCommas, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class AssignmentStat extends Statement {
	lhs: Expression[]
	rhs: Expression[]

	constructor(options: Options, lhs: Expression[], rhs: Expression[]) {
		super(options)
		this.lhs = lhs
		this.rhs = rhs
	}

	assemble(): TokenTree[] {
		return [
			assembleWithCommas(this.lhs),
			new Token(TokenType.Symbol, "="),
			assembleWithCommas(this.rhs)
		]
	}
}
