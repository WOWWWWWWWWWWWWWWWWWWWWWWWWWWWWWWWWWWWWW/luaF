import { Block } from "@ast/Base"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { AssignmentStat } from "@ast/statements/AssignmentStat"
import { LocalVarStat } from "@ast/statements/LocalVarStat"
import { Token } from "@ast/Token"
import { Walker } from "@utils/Walker"

import "@extensions/Array"

export default function (root: Block): Block {
	console.log("doing variableGrouping transformer")

	const visitor = new Walker()

	const buffers: Map<Block, Token[]> = new Map()

	function localVarToAssignment(
		stat: LocalVarStat,
		block: Block
	): AssignmentStat | void {
		if (!stat.options.variableGrouping.enabled) return
		const buffer = buffers.get(block)
		if (!buffer)
			throw new Error(
				"Cannot enable variableGrouping for a specific statement. Use blocks instead."
			)

		stat.lhs.forEach((t) => buffer.push(new Token(t.type, t.source)))

		if (stat.rhs.length != 0)
			return new AssignmentStat(
				stat.options,
				stat.lhs.map((t) => new VariableExpr(t)),
				stat.rhs
			)
	}

	visitor.block = {
		enter: (block) => {
			if (block.options.variableGrouping.enabled) {
				buffers.set(block, [])
			}
		},
		leave: (block) => {
			const buffer = buffers.get(block)
			if (buffer && buffer.length != 0) {
				buffer.shuffle()
				block.stats.unshift(new LocalVarStat(block.options, buffer, []))
			}
		}
	}

	visitor.localVarStat = {
		leave: (stat, block) => localVarToAssignment(stat, block)
	}

	visitor.traverse(root)
	return root
}
