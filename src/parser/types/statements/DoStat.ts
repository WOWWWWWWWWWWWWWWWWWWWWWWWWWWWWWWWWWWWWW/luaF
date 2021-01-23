import { Block, Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class DoStat extends Statement {
    body: Block

    constructor(body: Block) {
        super()
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