import { Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { TokenTree } from "@ast/Token"
import { Call } from "@ast/expressions/CallExpr"

export class CallExprStat extends Statement {
	expr: Call

	constructor(options: Options, expr: Call) {
		super(options)
		this.expr = expr
	}

	assemble(): TokenTree[] {
		return this.expr.assemble()
	}
}
