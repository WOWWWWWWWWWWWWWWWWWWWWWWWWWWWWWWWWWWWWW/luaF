import { Block, Expression } from "../../parser/types/Base.ts";
import { Walker } from './../../parser/types/Walker.ts';
import { VariableExpr } from './../../parser/types/expressions/VariableExpr.ts';
import { LocalVarStat } from './../../parser/types/statements/LocalVarStat.ts';
import { Token, TokenType } from "../../parser/types/Token.ts";
import { Options } from "../../parser/types/Context.ts";

export default function (root: Block) {
    const visitor = new Walker()

    const alreadyAssigned: { [key: string]: string } = {}
    const flagged: Set<Expression> = new Set()

    const buffer: LocalVarStat[] = []

    let i = 0
    function substitute(expr: Expression, key: string, options: Options): VariableExpr {
        const wasAssignedAlready = alreadyAssigned[key]
        const ident = wasAssignedAlready || (alreadyAssigned[key] = "__rdl" + i++)

        if (!wasAssignedAlready) {
            buffer.push(
                new LocalVarStat(
                    options,
                    [new Token(TokenType.Ident, ident)],
                    [expr]
                )
            )

            flagged.add(expr)
        }


        return new VariableExpr(new Token(TokenType.Ident, ident))
    }


    visitor.numberLiteral = {
        leave: (expr, stat) => {
            if (!flagged.has(expr))
                return substitute(expr, expr.value.toString(), stat.options)
        }
    }

    visitor.stringLiteral = {
        leave: (expr, stat) => {
            if (!flagged.has(expr))
                return substitute(expr, expr.value.toString(), stat.options)
        }
    }

    visitor.nilLiteral = {
        leave: (expr, stat) => {
            if (!flagged.has(expr))
                return substitute(expr, "nil", stat.options)
        }
    }

    visitor.booleanLiteral = {
        leave: (expr, stat) => {
            if (!flagged.has(expr))
                return substitute(expr, expr.value.toString(), stat.options)
        }
    }

    visitor.traverse(root)

    buffer.shuffle()
    root.stats.unshift(...buffer)

    return root
}