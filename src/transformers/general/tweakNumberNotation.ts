import { Block } from "../../parser/types/Base.ts";
import { Token, TokenType } from "../../parser/types/Token.ts";
import { Walker } from './../../parser/types/Walker.ts';

import "../../extensions/String.ts"

export default function (root: Block) {
    const visitor = new Walker()

    visitor.numberLiteral = {
        leave: (expr, stat) => {
            const opt = stat.options.tweakNumberNotation
            if (opt.enabled) {
                const src = expr.value
                if (opt.hex && src % 1 == 0) {
                    expr.toToken = function (): Token {
                        return new Token(
                            TokenType.Number,
                            ("0x" + expr.value.toString(16)).mock()
                        )
                    }
                } else if (opt.exponent) {
                    expr.toToken = function (): Token {
                        return new Token(
                            TokenType.Number,
                            expr.value.toExponential()
                                .replace(/e\+/i, "e") // lua doesn't have e+ or E+
                                .mock()
                        )
                    }
                }
            }
        }
    }

    visitor.traverse(root)
    return root
}