import { Block } from "../../parser/types/Base.ts";
import { MatchOddBackslashes } from "../../utils/constants.ts";
import { Walker } from './../../parser/types/Walker.ts';

function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function (root: Block) {
    const visitor = new Walker()

    visitor.stringLiteral = {
        leave: (expr, stat) => {
            const opt = stat.options.obnoxiousStringLiterals
            if (opt.min > opt.max)
                throw new Error(`obnoxiousStringLiterals: Minimum (${opt.min}) is greater than maximum (${opt.max})`);


            if (opt && opt.enabled) {
                // Eligible string literals are long strings and short ones without escapes
                const eligible = expr.openingQuote.includes("[") ||
                    !(new RegExp(MatchOddBackslashes.source + /[\drnt"'\\]/.source).test(expr.value))

                if (eligible) {
                    expr.openingQuote = `[${'='.repeat(randomInteger(opt.min || 50, opt.max || 100))}[`
                }
            }
        }
    }

    visitor.traverse(root)
    return root
}