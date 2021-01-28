import { Block } from "@ast/Base"
import { ArgCall } from "@ast/expressions/CallExpr"
import { FieldExpr } from "@ast/expressions/FieldExpr"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	console.log("doing expandInvoke transformer")

	const visitor = new Walker()

	visitor.argCall = {
		leave: (expr, stat) => {
			const opt = stat.options.expandInvoke

			if (expr.method_token && opt.enabled) {
				expr.arguments.unshift(expr.base)
				expr.base = new FieldExpr(expr.base, expr.method_token)
				delete expr.method_token
			}
		}
	}

	visitor.stringCall = {
		leave: (expr, stat) => {
			const opt = stat.options.expandInvoke

			if (expr.method_token && opt.enabled) {
				return new ArgCall(new FieldExpr(expr.base, expr.method_token), [
					expr.base,
					StringLiteral.fromToken(expr.arg)
				])
			}
		}
	}

	visitor.tableCall = {
		leave: (expr, stat) => {
			const opt = stat.options.expandInvoke

			if (expr.method_token && opt.enabled) {
				return new ArgCall(new FieldExpr(expr.base, expr.method_token), [
					expr.base,
					expr.table
				])
			}
		}
	}

	visitor.traverse(root)
	return root
}
