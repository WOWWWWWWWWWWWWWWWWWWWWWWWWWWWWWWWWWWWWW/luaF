import { Statement } from "../Base.ts";
import { TokenTree } from "../Token.ts";
import { Call } from './../expressions/CallExpr.ts';

export class CallExprStat extends Statement {
    expr: Call

    constructor(expr: Call) {
        super()
        this.expr = expr
    }

    assemble(): TokenTree[] {
        return this.expr.assemble()
    }
}