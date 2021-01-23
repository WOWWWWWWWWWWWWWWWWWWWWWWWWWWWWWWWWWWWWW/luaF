import { Expression } from "../Base.ts";
import { Token, TokenTree } from "../Token.ts";

export default class BinopExpr extends Expression {
    lhs: Expression
    op: Token
    rhs: Expression

    constructor(lhs: Expression, op: Token, rhs: Expression) {
        super()
        this.lhs = lhs
        this.op = op
        this.rhs = rhs
    }

    assemble(): TokenTree[] {
        return [this.lhs.assemble(), this.op, this.rhs.assemble()];
    }
}