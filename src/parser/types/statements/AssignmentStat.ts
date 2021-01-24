import { assembleWithCommas, Expression, Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class AssignmentStat extends Statement {
    lhs: Expression[]
    rhs: Expression[]

    constructor(lhs: Expression[], rhs: Expression[]) {
        super()
        this.lhs = lhs
        this.rhs = rhs
    }

    assemble(): TokenTree[] {
        return [
            assembleWithCommas(this.lhs),
            new Token(TokenType.Symbol, "="),
            assembleWithCommas(this.rhs)
        ];
    }
}