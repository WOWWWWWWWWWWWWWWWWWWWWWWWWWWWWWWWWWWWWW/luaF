import { Statement } from "../Base.ts";
import { TokenTree } from "../Token.ts";
import { ArgCall, StringCall, TableCall } from './../expressions/CallExpr.ts';

type Call = ArgCall | StringCall | TableCall
export default class CallExprStat extends Statement {
    expr: Call

    constructor(expr: Call) {
        super()
        this.expr = expr
    }

    assemble(): TokenTree[] {
        return this.expr.assemble()
    }
}