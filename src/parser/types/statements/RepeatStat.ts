import { Block, Expression, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class RepeatStat extends Statement {
    body: Block
    condition: Expression

    constructor(options: Options, body: Block, condition: Expression) {
        super(options)
        this.body = body
        this.condition = condition
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "repeat"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "until"),
            this.condition.assemble()
        ]
    }
}