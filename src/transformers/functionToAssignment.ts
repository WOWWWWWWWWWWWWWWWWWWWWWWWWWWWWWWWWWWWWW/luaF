import { Block, Expression } from "@ast/Base"
import { FieldExpr } from "@ast/expressions/FieldExpr"
import { FunctionLiteral } from "@ast/expressions/FunctionLiteral"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { AssignmentStat } from "@ast/statements/AssignmentStat"
import { LocalVarStat } from "@ast/statements/LocalVarStat"
import { Token, TokenType } from "@ast/Token"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	console.log("doing functionToAssignment transformer")

	const visitor = new Walker()

	visitor.functionStat = {
		leave: (stat) => {
			const opt = stat.options.functionToAssignment

			if (opt.enabled) {
				const namechain = stat.namechain

				if (stat.local) {
					// only one in namechain
					return new LocalVarStat(
						stat.options,
						[namechain[0]],
						[new FunctionLiteral(stat.arglist, stat.body)]
					)
				} else {
					let assignment: Expression = new VariableExpr(namechain[0])

					let i = 1
					while (namechain[i]?.source == ".") {
						i++
						const field = namechain[i]
						if (!field) throw new Error("Field expected in function namechain.")

						assignment = new FieldExpr(assignment, field)
						i++
					}

					if (namechain[i]?.source == ":") {
						i++
						stat.arglist.unshift(new Token(TokenType.Ident, "self")) // insert self
						const field = namechain[i]
						if (!field) throw new Error("Field expected in function namechain.")

						assignment = new FieldExpr(assignment, field)
					}

					return new AssignmentStat(
						stat.options,
						[assignment],
						[new FunctionLiteral(stat.arglist, stat.body)]
					)
				}
			}
		}
	}

	visitor.traverse(root)
	return root
}
