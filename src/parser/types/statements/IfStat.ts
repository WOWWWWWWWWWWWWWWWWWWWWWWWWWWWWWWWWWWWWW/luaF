import { Block, Expression, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class ElseClause {
    condition?: Expression
    body: Block

    constructor(condition: Expression | undefined, body: Block) {
        this.condition = condition
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            ...this.condition ?
                [
                    new Token(TokenType.Keyword, "elseif"),
                    this.condition.assemble(),
                    new Token(TokenType.Keyword, "then")
                ] :
                [
                    new Token(TokenType.Keyword, "else")
                ],
            this.body.assemble()
        ]
    }
}

export class IfStat extends Statement {
    condition: Expression
    body: Block
    elseClauses: ElseClause[]

    constructor(options: Options, condition: Expression, body: Block, elseClauses: ElseClause[]) {
        super(options)
        this.condition = condition
        this.body = body
        this.elseClauses = elseClauses
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "if"),
            this.condition.assemble(),
            new Token(TokenType.Keyword, "then"),
            this.body.assemble(),
            this.elseClauses.map(ec => ec.assemble()),
            new Token(TokenType.Keyword, "end")
        ]
    }
}