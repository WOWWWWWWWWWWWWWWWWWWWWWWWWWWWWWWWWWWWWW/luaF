import { assembleTokensWithCommas, assembleWithCommas, Expression, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class LocalVarStat extends Statement {
    lhs: Token[]
    rhs: Expression[]

    constructor(options: Options, lhs: Token[], rhs: Expression[]) {
        super(options)
        this.lhs = lhs
        this.rhs = rhs
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "local"),
            assembleTokensWithCommas(this.lhs),
            ...this.rhs.length != 0 ?
                [
                    new Token(TokenType.Symbol, "="),
                    assembleWithCommas(this.rhs)
                ] : []
        ];
    }
}