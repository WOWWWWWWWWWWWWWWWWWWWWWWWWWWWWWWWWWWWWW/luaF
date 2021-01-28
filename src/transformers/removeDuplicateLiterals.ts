import { Block, Expression } from "@ast/Base"
import { Walker } from "@utils/Walker"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { LocalVarStat } from "@ast/statements/LocalVarStat"
import { Token, TokenType } from "@ast/Token"
import { Options } from "@utils/Context"

import "@extensions/Array"

export default function (root: Block): Block {
	console.log("doing removeDuplicateLiterals transformer")

	const visitor = new Walker()

	const alreadyAssigned: { [key: string]: string } = {}

	const buffer: LocalVarStat[] = []

	let i = 0
	function substitute(
		expr: Expression,
		key: string,
		options: Options
	): VariableExpr {
		const wasAssignedAlready = alreadyAssigned[key]
		const ident = wasAssignedAlready || (alreadyAssigned[key] = "__rdl" + i++)

		if (!wasAssignedAlready) {
			buffer.push(
				new LocalVarStat(options, [new Token(TokenType.Ident, ident)], [expr])
			)
		}

		return new VariableExpr(new Token(TokenType.Ident, ident))
	}

	visitor.numberLiteral = {
		leave: (expr, stat) => {
			if (stat.options.removeDuplicateLiterals.enabled)
				return substitute(expr, expr.value.toString(), stat.options)
		}
	}

	visitor.stringLiteral = {
		leave: (expr, stat) => {
			if (stat.options.removeDuplicateLiterals.enabled)
				return substitute(expr, expr.value.toString(), stat.options)
		}
	}

	visitor.nilLiteral = {
		leave: (expr, stat) => {
			if (stat.options.removeDuplicateLiterals.enabled)
				return substitute(expr, "nil", stat.options)
		}
	}

	visitor.booleanLiteral = {
		leave: (expr, stat) => {
			if (stat.options.removeDuplicateLiterals.enabled)
				return substitute(expr, expr.value.toString(), stat.options)
		}
	}

	visitor.traverse(root)

	buffer.shuffle()
	root.stats.unshift(...buffer)

	return root
}
