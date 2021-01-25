import { assembleTokensWithCommas, assembleWithCommas, Block, Expression, Statement } from "../Base.ts";
import { Options } from "../Context.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class NumericForStat extends Statement {
    varlist: Token[]
    rangelist: Expression[]
    body: Block

    constructor(options: Options, varlist: Token[], rangelist: Expression[], body: Block) {
        super(options)
        this.varlist = varlist
        this.rangelist = rangelist
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "for"),
            assembleTokensWithCommas(this.varlist),
            new Token(TokenType.Keyword, "="),
            assembleWithCommas(this.rangelist),
            new Token(TokenType.Keyword, "do"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "end")
        ]
    }
}

export class GenericForStat extends Statement {
    varlist: Token[]
    generatorlist: Expression[]
    body: Block

    constructor(options: Options, varlist: Token[], generatorlist: Expression[], body: Block) {
        super(options)
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