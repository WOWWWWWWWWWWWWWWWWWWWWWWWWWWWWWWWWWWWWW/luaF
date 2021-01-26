import { Block } from "../../parser/types/Base.ts";
import { VariableExpr } from "../../parser/types/expressions/VariableExpr.ts";
import { AssignmentStat } from "../../parser/types/statements/AssignmentStat.ts";
import { LocalVarStat } from "../../parser/types/statements/LocalVarStat.ts";
import { Token } from "../../parser/types/Token.ts";
import { Walker } from './../../parser/types/Walker.ts';

import "../../extensions/Array.ts";

export default function (root: Block) {
    const visitor = new Walker()

    const buffers: Map<Block, Token[]> = new Map()

    function localVarToAssignment(stat: LocalVarStat, block: Block): AssignmentStat | void {
        const buffer = buffers.get(block)
        if (!buffer) throw new Error("unreachable");

        stat.lhs.forEach(t => buffer.push(new Token(t.type, t.source)))

        if (stat.rhs.length != 0)
            return new AssignmentStat(
                stat.options,
                stat.lhs.map(t => new VariableExpr(t)),
                stat.rhs
            )
    }

    visitor.block = {
        enter: block => {
            if (block.options.variableGrouping.enabled) {
                buffers.set(block, [])
            }
        },
        leave: block => {
            const buffer = buffers.get(block)
            if (buffer && buffer.length != 0) {
                buffer.shuffle()
                block.stats.unshift(
                    new LocalVarStat(block.options, buffer, [])
                )
            }
        }
    }

    visitor.localVarStat = {
        leave: (stat, block) => localVarToAssignment(stat, block)
    }

    visitor.traverse(root)
    return root
}