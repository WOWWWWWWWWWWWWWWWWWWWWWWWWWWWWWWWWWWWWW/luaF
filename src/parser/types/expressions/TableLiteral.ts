import { assembleWithCommas, Expression, TableEntry } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

class TableIndex extends TableEntry {
    index: Expression
    value: Expression

    constructor(index: Expression, value: Expression) {
        super()
        this.index = index
        this.value = value
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Symbol, "["),
            this.index.assemble(),
            new Token(TokenType.Symbol, "]"),
            new Token(TokenType.Symbol, "="),
            this.value.assemble()
        ]
    }
}

class TableField extends TableEntry {
    field: Token
    value: Expression

    constructor(field: Token, value: Expression) {
        super()
        this.field = field
        this.value = value
    }

    assemble(): TokenTree[] {
        return [
            this.field,
            new Token(TokenType.Symbol, "="),
            this.value.assemble()
        ]
    }
}

class TableValue extends TableEntry {
    value: Expression

    constructor(value: Expression) {
        super()
        this.value = value
    }

    assemble(): TokenTree[] {
        return this.value.assemble()
    }
}

export default class TableLiteral extends Expression {
    entryList: TableEntry[]

    constructor(entryList: TableEntry[]) {
        super()
        this.entryList = entryList
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Symbol, "{"),
            assembleWithCommas(this.entryList),
            new Token(TokenType.Symbol, "}"),
        ]
    }
}