import { Expression } from "../Base.ts";
import { Token, TokenTree } from "../Token.ts";

export default class BinopExpr extends Expression {
    op: Token
    base: Expression

    constructor(op: Token, base: Expression) {
        super()
        this.op = op
        this.base = base
    }

    assemble(): TokenTree[] {
        return [this.op, this.base.assemble()];
    }
}