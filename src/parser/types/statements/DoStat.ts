import { Block, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class DoStat extends Statement {
    body: Block

    constructor(options: Options, body: Block) {
        super(options)
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "do"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "end")
        ]
    }
}