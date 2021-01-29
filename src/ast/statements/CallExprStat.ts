import { Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { TokenTree } from "@ast/Token"
import { Call } from "@ast/expressions/CallExpr"

export class CallExprStat extends Statement {
	constructor(options: Options, public expr: Call) {
		super(options)
	}

	assemble(): TokenTree[] {
		return this.expr.assemble()
	}
}
