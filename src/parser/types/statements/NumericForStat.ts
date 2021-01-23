import { assembleTokensWithCommas, assembleWithCommas, Block, Expression, Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class NumericForStat extends Statement {
    varlist: Token[]
    rangelist: Expression[]
    body: Block

    constructor(varlist: Token[], rangelist: Expression[], body: Block) {
        super()
        this.varlist = varlist
        this.rangelist = rangelist
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "for"),
            assembleTokensWithCommas(this.varlist),
            new Token(TokenType.Keyword, "="),
            assembleWithCommas(this.rangelist),
            new Token(TokenType.Keyword, "do"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "end")
        ]
    }
}