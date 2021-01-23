import { assembleWithCommas, Expression, Statement } from "../Base.ts";
import { TokenTree, Token, TokenType } from "../Token.ts";

export default class ReturnStat extends Statement {
    list: Expression[]

    constructor(list: Expression[]) {
        super()
        this.list = list
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "return"),
            assembleWithCommas(this.list)
        ]
    }
}