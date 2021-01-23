import { Block, Expression, Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class RepeatStat extends Statement {
    body: Block
    condition: Expression

    constructor(body: Block, condition: Expression) {
        super()
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