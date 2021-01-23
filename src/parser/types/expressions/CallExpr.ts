import { assembleWithCommas, Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";
import TableLiteral from "./TableLiteral.ts";

export class ArgCall extends Expression {
    base: Expression
    arguments: Expression[]
    method_token?: Token

    constructor(base: Expression, args: Expression[], mt?: Token) {
        super()
        this.base = base
        this.arguments = args
        this.method_token = mt
    }

    assemble(): TokenTree[] {
        if (this.method_token) {
            return [
                this.base.assemble(),
                new Token(TokenType.Symbol, ":"),
                this.method_token,
                new Token(TokenType.Symbol, "("),
                assembleWithCommas(this.arguments),
                new Token(TokenType.Symbol, ")")
            ]
        }

        return [
            this.base.assemble(),
            new Token(TokenType.Symbol, "("),
            assembleWithCommas(this.arguments),
            new Token(TokenType.Symbol, ")")
        ]
    }
}

export class StringCall extends Expression {
    base: Expression
    arg: Token
    method_token?: Token

    constructor(base: Expression, arg: Token, mt?: Token) {
        super()
        this.base = base
        this.arg = arg
        this.method_token = mt
    }

    assemble(): TokenTree[] {
        if (this.method_token) {
            return [
                this.base.assemble(),
                new Token(TokenType.Symbol, ":"),
                this.method_token,
                this.arg
            ]
        }

        return [this.base.assemble(), this.arg]
    }
}

export class TableCall extends Expression {
    base: Expression
    table: TableLiteral
    method_token?: Token

    constructor(base: Expression, table: TableLiteral, mt?: Token) {
        super()
        this.base = base
        this.table = table
        this.method_token = mt
    }

    assemble(): TokenTree[] {
        if (this.method_token) {
            return [
                this.base.assemble(),
                new Token(TokenType.Symbol, ":"),
                this.method_token,
                this.table.assemble()
            ]
        }

        return [this.base.assemble(), this.table.assemble()]
    }
}
