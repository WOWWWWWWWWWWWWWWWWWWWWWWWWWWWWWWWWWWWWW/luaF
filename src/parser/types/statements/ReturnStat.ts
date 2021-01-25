import { assembleWithCommas, Expression, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { TokenTree, Token, TokenType } from "../Token.ts";

export class ReturnStat extends Statement {
    list: Expression[]

    constructor(options: Options, list: Expression[]) {
        super(options)
        this.list = list
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "return"),
            assembleWithCommas(this.list)
        ]
    }
}