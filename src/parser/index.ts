import { lexer } from "./lexer.ts";
import { Block, Expression, Statement, TableEntry } from "./types/Base.ts";
import { StreamedToken, Token, TokenType } from "./types/Token.ts";

import { ParenExpr } from "./types/expressions/ParenExpr.ts";
import { VariableExpr } from "./types/expressions/VariableExpr.ts";
import { TableField, TableIndex, TableLiteral, TableValue } from "./types/expressions/TableLiteral.ts";
import { FunctionLiteral } from './types/expressions/FunctionLiteral.ts';
import { FunctionStat } from './types/statements/FunctionStat.ts';
import { FieldExpr } from './types/expressions/FieldExpr.ts';
import { IndexExpr } from './types/expressions/IndexExpr.ts';
import { CallExprStat } from "./types/statements/CallExprStat.ts";
import { ArgCall, Call, StringCall, TableCall } from "./types/expressions/CallExpr.ts";
import { NilLiteral } from './types/expressions/NilLiteral.ts';
import { BooleanLiteral } from './types/expressions/BooleanLiteral.ts';
import { VargLiteral } from './types/expressions/VargLiteral.ts';
import { NumberLiteral } from './types/expressions/NumberLiteral.ts';
import { StringLiteral } from './types/expressions/StringLiteral.ts';
import { UnopExpr } from "./types/expressions/UnopExpr.ts";
import { BinopExpr } from './types/expressions/BinopExpr.ts';
import { AssignmentStat } from './types/statements/AssignmentStat.ts';
import { IfStat, ElseClause } from './types/statements/IfStat.ts';
import { DoStat } from './types/statements/DoStat.ts';
import { WhileStat } from './types/statements/WhileStat.ts';
import { NumericForStat, GenericForStat } from './types/statements/ForStat.ts';
import { RepeatStat } from './types/statements/RepeatStat.ts';
import { LocalVarStat } from './types/statements/LocalVarStat.ts';
import { ReturnStat } from './types/statements/ReturnStat.ts';
import { BreakStat } from './types/statements/BreakStat.ts';

const BinaryPriority: { [key: string]: [number, number] } = {
    "+": [6, 6],
    "-": [6, 6],
    "*": [7, 7],
    "/": [7, 7],
    "%": [7, 7],
    "^": [10, 9],
    "..": [5, 4],
    "==": [3, 3],
    "~=": [3, 3],
    ">": [3, 3],
    "<": [3, 3],
    ">=": [3, 3],
    "<=": [3, 3],
    "and": [2, 2],
    "or": [1, 1]
}

export function parse(input: string): Block {
    const tokenStream = lexer(input);
    let p = 0;

    const get = () => tokenStream[p++];
    const peek = (n = 0) => tokenStream[p + n]

    function panic(msg: string): never {
        let line = 1;
        let char = 0;
        for (const token of tokenStream.slice(0, p)) {
            const src = token.leadingWhite + token.source

            const i = src.lastIndexOf("\n")
            if (i != -1) {
                line += src.split("\n").length - 1
                char = src.length - i
            } else {
                char += src.length
            }
        }

        throw new Error(`error: ${msg}.\n${peek().toString()} at <${line}:${char + 1}>`);
    }

    function expect(type: TokenType, source?: string): StreamedToken {
        const tk = peek()
        if (tk.type == type && (source == undefined || tk.source == source)) {
            return get()
        } else {
            panic(`${new Token(type, source || "?").toString()} expected`)
        }
    }

    // What the fuck deno

    // deno-lint-ignore prefer-const
    let block: () => Block;

    // deno-lint-ignore prefer-const
    let expr: () => Expression;

    function exprlist(): Expression[] {
        const exprList: Expression[] = []
        exprList.push(expr())
        while (peek().source == ",") {
            p++ // get();
            exprList.push(expr())
        }
        return exprList
    }

    type PrefixExpression = ParenExpr | VariableExpr
    function prefixexpr(): PrefixExpression {
        const tk = peek()
        if (tk.source == "(") {
            p++ // get();
            const inner = expr()
            expect(TokenType.Symbol, ")");
            return new ParenExpr(inner)
        } else if (tk.type == TokenType.Ident) {
            return new VariableExpr(get())
        } else {
            panic("Unexpected symbol")
        }
    }

    function tableexpr(): TableLiteral {
        expect(TokenType.Symbol, "{");
        const entries: TableEntry[] = []

        const t1 = peek()
        while (t1.source != "}") {
            if (t1.source == "[") {
                // Index
                p++ // get();
                const index = expr()
                expect(TokenType.Symbol, "]")
                expect(TokenType.Symbol, "=")
                const value = expr()
                entries.push(new TableIndex(index, value))
            } else if (t1.type == TokenType.Ident && peek(1).source == "=") {
                const field = get()
                p++ // get();
                const value = expr()
                entries.push(new TableField(field, value))
            } else {
                entries.push(new TableValue(expr()))
            }

            const { source: seperator } = peek()
            if (seperator == ',' || seperator == ';') {
                p++ // get();
            } else {
                break
            }
        }

        expect(TokenType.Symbol, "}")
        return new TableLiteral(entries)
    }

    function varlist(acceptVarg: boolean): Token[] {
        const varList: Token[] = []
        const t1 = peek()

        if (t1.type == TokenType.Ident) {
            varList.push(get())
        } else if (t1.source == "..." && acceptVarg) {
            varList.push(get())
            return varList
        }

        while (peek().source == ",") {
            varList.push(get())
            if (peek().source == "..." && acceptVarg) {
                varList.push(get())
                return varList
            } else {
                varList.push(expect(TokenType.Ident))
            }
        }

        return varList
    }

    function blockbody(terminator: string): Block {
        const body = block()
        expect(TokenType.Keyword, terminator)
        return body
    }

    function funcdecl(local: boolean): FunctionStat {
        get().context(null) // Function Keyword

        const nameChain: Token[] = []

        nameChain.push(expect(TokenType.Ident))

        while (peek().source == ".") {
            nameChain.push(get())
            nameChain.push(expect(TokenType.Ident))
        }

        if (peek().source == ":") {
            nameChain.push(get())
            nameChain.push(expect(TokenType.Ident))
        }

        expect(TokenType.Symbol, "(")
        const argList = varlist(true)
        expect(TokenType.Symbol, ")")

        const body = blockbody("end")

        return new FunctionStat(local, nameChain, argList, body)
    }

    function funcliteral(): FunctionLiteral {
        p++ // get(); // Function Keyword

        expect(TokenType.Symbol, "(")
        const argList = varlist(true)
        expect(TokenType.Symbol, ")")

        const body = blockbody("end")

        return new FunctionLiteral(argList, body)
    }

    type PrimaryExpression = FieldExpr | IndexExpr | Call | PrefixExpression
    function primaryexpr(): PrimaryExpression {
        let method: Token | undefined;
        let base: PrimaryExpression = prefixexpr();

        while (true) {
            const tk = peek()
            switch (tk.source) {
                case ".":
                    p++ // get();
                    base = new FieldExpr(base,
                        expect(TokenType.Ident) // fieldName
                    )
                    break;
                case ":":
                    p++ // get();
                    method = expect(TokenType.Ident)
                    break;
                case "[": {
                    p++ // get();
                    const indexer = expr()
                    expect(TokenType.Symbol, "]")
                    base = new IndexExpr(base, indexer)
                    break;
                }
                case "(": {
                    const argList: Expression[] = []

                    p++ // get();
                    while (peek().source != ")") {
                        argList.push(expr())
                        if (peek().source == ",") {
                            p++ // get();
                        } else {
                            break
                        }
                    }
                    p++ // get();

                    base = new ArgCall(base, argList, method)
                    break;
                }
                case "{":
                    base = new TableCall(base, tableexpr(), method)
                    break;
                default:
                    if (tk.type == TokenType.String) {
                        base = new StringCall(base, get(), method)
                        break;
                    } else {
                        return base
                    }
            }
        }
    }

    function simpleexpr(): Expression {
        const tk = peek()
        switch (tk.source) {
            case "nil":
                p++ // get();
                return new NilLiteral()
            case "true":
            case "false":
                p++ // get();
                return new BooleanLiteral(tk.source == "true")
            case "...":
                p++ // get();
                return new VargLiteral()
            case "{":
                return tableexpr()
            case "function":
                return funcliteral()
            default:
                switch (tk.type) {
                    case TokenType.Number:
                        return new NumberLiteral(get())
                    case TokenType.String:
                        return new StringLiteral(get())
                    default:
                        return primaryexpr()
                }

        }
    }

    function subexpr(limit: number): Expression {
        let curNode: Expression | undefined;

        if (peek().isUnop()) {
            const op: Token = get()
            const base = subexpr(8) // 8 is the Unary Priority
            curNode = new UnopExpr(op, base)
        } else {
            curNode = simpleexpr()
        }

        let pk: StreamedToken

        type Priority = [number, number] | undefined;
        let priority: Priority;
        while (
            (pk = peek()).isBinop() &&
            (priority = <Priority>BinaryPriority[pk.source]) &&
            priority[0] > limit
        ) {
            const op: Token = get()
            const rhs = subexpr(priority[1])
            curNode = new BinopExpr(curNode, op, rhs)
        }

        if (curNode)
            return curNode
        else
            panic("curNode is undefined")
    }

    expr = () => subexpr(0)

    function exprstat(): CallExprStat | AssignmentStat {
        const ex = primaryexpr()
        if (ex instanceof Call) {
            return new CallExprStat(ex)
        } else {
            const lhs: Expression[] = [ex]
            while (peek().source == ",") {
                p++ // get();
                const lhsPart = primaryexpr()
                if (lhsPart instanceof Call) {
                    panic("Bad left hand side of assignment")
                }
                lhs.push(lhsPart)
            }
            expect(TokenType.Symbol, "=")
            const rhs: Expression[] = [expr()]
            while (peek().source == ",") {
                p++ // get();
                rhs.push(expr())
            }
            return new AssignmentStat(lhs, rhs)
        }
    }

    function ifstat(): IfStat {
        get().context(null)
        const condition = expr()
        expect(TokenType.Keyword, "then")
        const body = block()

        const elseClauses: ElseClause[] = []

        let tk
        while ((tk = peek()).source == "elseif" || tk.source == "else") {
            p++ // get();
            let elseCondition: Expression | undefined
            if (tk.source == "elseif") {
                elseCondition = expr()
                expect(TokenType.Keyword, "then")
            }
            const elseBody = block()
            elseClauses.push(new ElseClause(condition, body))
            if (tk.source == "else") {
                break
            }
        }
        expect(TokenType.Keyword, "end")
        return new IfStat(condition, body, elseClauses)
    }

    function dostat(): DoStat {
        get().context(null)
        return new DoStat(blockbody("end"))
    }

    function whilestat(): WhileStat {
        get().context(null)
        const condition = expr()
        expect(TokenType.Keyword, "do")
        const body = blockbody("end")
        return new WhileStat(condition, body)
    }

    function forstat(): NumericForStat | GenericForStat {
        get().context(null)
        const loopVars = varlist(false)

        const tk = peek()
        if (tk.source == "=") {
            p++ // get();
            const rangeList = exprlist()
            if (rangeList.length < 2 || rangeList.length > 3) {
                panic("expected 2 or 3 values for range bounds")
            }
            expect(TokenType.Keyword, "do")
            const body = blockbody("end")
            return new NumericForStat(loopVars, rangeList, body)
        } else if (tk.source == "in") {
            p++ // get();
            const generatorList = exprlist()
            expect(TokenType.Keyword, "do")
            const body = blockbody("end")
            return new GenericForStat(loopVars, generatorList, body)
        } else {
            panic("expected `=` or `in` as part of for loop")
        }
    }

    function repeatstat(): RepeatStat {
        get().context(null)
        const body = blockbody("until")
        const condition = expr()
        return new RepeatStat(body, condition)
    }

    function localdecl(): FunctionStat | LocalVarStat {
        get().context(null)
        const tk = peek()
        if (tk.source == "function") {
            const funcStat = funcdecl(true)
            if (funcStat.namechain.length > 1) {
                panic("`.` and `:` not allowed in local functions.")
            }
            return funcStat
        } else if (tk.type == TokenType.Ident) {
            const varList = varlist(false)
            let exprList: Expression[] = [];
            if (peek().source == "=") {
                p++ // get();
                exprList = exprlist()
            }
            return new LocalVarStat(varList, exprList)
        } else {
            panic("expected `function` or ident after `local`")
        }
    }

    function retstat(): ReturnStat {
        get().context(null)
        let exprList: Expression[] = []

        const tk = peek()
        if (!tk.isBlockFollow() && tk.source != ";") {
            exprList = exprlist()
        }

        return new ReturnStat(exprList)
    }

    function breakstat(): BreakStat {
        get().context(null)
        return new BreakStat()
    }

    function statement(): [boolean, Statement] {
        const tk = peek()
        switch (tk.source) {
            case "if":
                return [false, ifstat()]
            case "while":
                return [false, whilestat()]
            case "do":
                return [false, dostat()]
            case "for":
                return [false, forstat()]
            case "repeat":
                return [false, repeatstat()]
            case "function":
                return [false, funcdecl(false)]
            case "local":
                return [false, localdecl()]
            case "return":
                return [true, retstat()]
            case "break":
                return [true, breakstat()]
            default:
                return [false, exprstat()]
        }
    }

    block = () => {
        const statements: Statement[] = []
        let isLast = false
        while (!isLast && !peek().isBlockFollow()) {
            let stat: Statement;
            [isLast, stat] = statement()
            statements.push(stat)

            const tk = peek()
            if (tk.type == TokenType.Symbol && tk.source == ";") {
                p++ // get();
            }
        }
        return new Block(statements)
    }

    return block()
}