import { assembleTokensWithCommas, assembleWithCommas, Block, Expression, Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class GenericForStat extends Statement {
    varlist: Token[]
    generatorlist: Expression[]
    body: Block

    constructor(varlist: Token[], generatorlist: Expression[], body: Block) {
        super()
        this.varlist = varlist
        this.generatorlist = generatorlist
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "for"),
            assembleTokensWithCommas(this.varlist),
            new Token(TokenType.Keyword, "in"),
            assembleWithCommas(this.generatorlist),
            new Token(TokenType.Keyword, "do"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "end")
        ]
    }
}