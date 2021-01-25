import { Block, Expression, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class WhileStat extends Statement {
    condition: Expression
    body: Block

    constructor(options: Options, condition: Expression, body: Block) {
        super(options)
        this.condition = condition
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "while"),
            this.condition.assemble(),
            new Token(TokenType.Keyword, "do"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "end"),
        ]
    }
}