import { assembleWithCommas, Expression } from "@ast/Base"
import { Token, TokenTree, TokenType } from "@ast/Token"
import { TableLiteral } from "./TableLiteral"

export abstract class Call extends Expression {}

export class ArgCall extends Call {
	constructor(
		public base: Expression,
		public args: Expression[],
		public method_token?: Token
	) {
		super()
	}

	assemble(): TokenTree[] {
		if (this.method_token) {
			return [
				this.base.assemble(),
				new Token(TokenType.Symbol, ":"),
				this.method_token,
				new Token(TokenType.Symbol, "("),
				assembleWithCommas(this.args),
				new Token(TokenType.Symbol, ")")
			]
		}

		return [
			this.base.assemble(),
			new Token(TokenType.Symbol, "("),
			assembleWithCommas(this.args),
			new Token(TokenType.Symbol, ")")
		]
	}
}

export class StringCall extends Call {
	constructor(
		public base: Expression,
		public arg: Token,
		public method_token?: Token
	) {
		super()
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

export class TableCall extends Call {
	constructor(
		public base: Expression,
		public table: TableLiteral,
		public method_token?: Token
	) {
		super()
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
