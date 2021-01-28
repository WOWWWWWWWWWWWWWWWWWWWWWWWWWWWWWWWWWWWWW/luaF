import { Block } from "@ast/Base"
import { ArgCall } from "@ast/expressions/CallExpr"
import { FieldExpr } from "@ast/expressions/FieldExpr"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { LocalVarStat } from "@ast/statements/LocalVarStat"
import { Token, TokenType } from "@ast/Token"
import { Walker } from "@utils/Walker"
import { createVariableInfo } from "@variableInfo"
import { Global } from "@variableInfo/Variable"

export default function (root: Block): Block {
	const visitor = new Walker()

	console.log("creating variable info as per globalToEnv")
	createVariableInfo(root)
	console.log("hello")

	const envToken = new Token(TokenType.Ident, "_luaf_env")
	let used = false // check if any variable has been transformed
	visitor.variableExpr = {
		leave: (expr, stat) => {
			const opt = stat.options.globalToEnv
			if (
				opt.enabled &&
				expr.variable &&
				expr.variable instanceof Global &&
				!expr.variable.assignedTo
			) {
				used = true
				return new FieldExpr(new VariableExpr(envToken), expr.value)
			}
		}
	}

	console.log("doing globalToEnv transformer")
	visitor.traverse(root)

	if (used) {
		root.stats.unshift(
			new LocalVarStat(
				root.options,
				[envToken],
				[
					new ArgCall(
						new VariableExpr(new Token(TokenType.Ident, "getfenv")),
						[]
					)
				]
			)
		)
	}

	return root
}
