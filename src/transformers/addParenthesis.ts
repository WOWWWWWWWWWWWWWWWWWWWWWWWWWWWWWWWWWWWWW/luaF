import { Block, Expression, Statement } from "@ast/Base"
import { ParenExpr } from "@ast/expressions/ParenExpr"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	const visitor = new Walker()

	const enclose = (expr: Expression) => new ParenExpr(expr)
	const encloseVisitor = (expr: Expression, stat: Statement) => {
		if (stat.options.addParenthesis.enabled) return enclose(expr)
	}

	console.log("doing addParenthesis transformer")

	visitor.stringLiteral = { leave: encloseVisitor }
	visitor.numberLiteral = { leave: encloseVisitor }
	visitor.booleanLiteral = { leave: encloseVisitor }
	visitor.nilLiteral = { leave: encloseVisitor }
	visitor.tableLiteral = { leave: encloseVisitor }
	visitor.variableExpr = { leave: encloseVisitor }

	visitor.binopExpr = {
		leave: (expr, stat) => {
			if (stat.options.addParenthesis.enabled) {
				expr.lhs = enclose(expr.lhs)
				expr.rhs = enclose(expr.rhs)
			}
		}
	}

	visitor.unopExpr = {
		leave: (expr, stat) => {
			if (stat.options.addParenthesis.enabled) expr.base = enclose(expr.base)
		}
	}

	visitor.indexExpr = {
		leave: (expr, stat) => {
			if (stat.options.addParenthesis.enabled) {
				expr.base = enclose(expr.base)
				expr.index = enclose(expr.index)
			}
		}
	}

	visitor.argCall = {
		leave: (expr, stat) => {
			if (stat.options.addParenthesis.enabled) {
				expr.base = enclose(expr.base)
				expr.arguments = expr.arguments.map((e) => enclose(e))
			}
		}
	}

	visitor.stringCall = {
		leave: (expr, stat) => {
			if (stat.options.addParenthesis.enabled) expr.base = enclose(expr.base)
		}
	}

	visitor.tableCall = {
		leave: (expr, stat) => {
			if (stat.options.addParenthesis.enabled) expr.base = enclose(expr.base)
		}
	}

	// ParenExpr cannot appear in the lhs of assignments so we must sanitize them
	const sanitizer = new Walker()
	sanitizer.parenExpr = {
		leave: (expr) => {
			return expr.value
		}
	}

	visitor.assignmentStat = {
		leave: (stat, block) => {
			stat.lhs = stat.lhs.map((expr) => {
				return sanitizer._expression(expr, stat, block)
			})
		}
	}

	visitor.traverse(root)
	return root
}
