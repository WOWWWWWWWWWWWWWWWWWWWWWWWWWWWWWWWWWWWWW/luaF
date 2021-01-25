import { Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class BreakStat extends Statement {
    constructor(options: Options) {
        super(options)
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "break")
        ]
    }
}