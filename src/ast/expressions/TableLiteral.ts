import { assembleWithCommas, Expression, Node } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"

export abstract class TableEntry extends Node {}

export class TableIndex extends TableEntry {
	constructor(public index: Expression, public value: Expression) {
		super()
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

export class TableField extends TableEntry {
	constructor(public field: Token, public value: Expression) {
		super()
	}

	assemble(): TokenTree[] {
		return [this.field, new Token(TokenType.Symbol, "="), this.value.assemble()]
	}
}

export class TableValue extends TableEntry {
	constructor(public value: Expression) {
		super()
	}

	assemble(): TokenTree[] {
		return this.value.assemble()
	}
}

export class TableLiteral extends Expression {
	constructor(public entryList: TableEntry[]) {
		super()
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Symbol, "{"),
			assembleWithCommas(this.entryList),
			new Token(TokenType.Symbol, "}")
		]
	}
}
