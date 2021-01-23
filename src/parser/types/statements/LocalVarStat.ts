import { assembleTokensWithCommas, assembleWithCommas, Expression, Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class LocalVarStat extends Statement {
    lhs: Token[]
    rhs: Expression[]

    constructor(lhs: Token[], rhs: Expression[]) {
        super()
        this.lhs = lhs
        this.rhs = rhs
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "local"),
            assembleTokensWithCommas(this.lhs),
            new Token(TokenType.Symbol, "="),
            assembleWithCommas(this.rhs)
        ];
    }
}