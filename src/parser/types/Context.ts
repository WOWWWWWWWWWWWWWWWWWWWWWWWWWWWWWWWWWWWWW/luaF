import { deepCopy } from "../../utils/deepCopy.ts"

export interface Option {
    enabled: boolean
}

export class Options {
    [setting: string]: Option | undefined
    identifierRenaming = {
        enabled: false,
        mode: "alphabet",
        prefix: "",
        renameGlobals: false,
        increment: false
    }

    tweakNumberNotation = {
        enabled: false,
        hex: true,
        exponent: true
    }

    removeDuplicateLiterals = {
        enabled: false
    }

    variableGrouping = {
        enabled: false
    }

    obnoxiousStringLiterals = {
        enabled: false,
        min: 50,
        max: 100
    }
}

// get defaults as array
const Settings = Object.getOwnPropertyNames(new Options())

enum Scope {
    Global = 1,
    Block,
    Statement
}

export class Context {
    [index: string]: Options | ((scope: number, cmd: string) => void)
    global: Options
    block: Options
    statement: Options

    constructor() {
        this.global = new Options()
        this.block = new Options()
        this.statement = new Options()
    }

    private getScopes(scope: number): Options[] {
        const res = []

        if (scope == Scope.Global) {
            res.push(this.global)
        }

        if (scope <= Scope.Block) {
            res.push(this.block)
        }

        if (scope <= Scope.Statement) {
            res.push(this.statement)
        }

        return res
    }

    enable(scope: number, cmd: string) {
        const scopes = this.getScopes(scope);

        // Syntax: identifierRenaming, numberToHex
        // Option Syntax: identifierRenaming {mode: "underscore"}, numberToHex
        const check = [...cmd.matchAll(/\s*(\w+|\*)\s*({.+})?\s*(?:,|$)/gy)]
        if (cmd.split(",").length < check.length) {
            console.warn(`Was only able to parse ${check.length} commands in this annotation:\n${cmd}`)
        }
        for (const effects of check) {
            console.log(effects)
            const options = effects[2] && JSON.parse(effects[2])
            let props;
            if (effects[1] == "*") {
                props = Settings
            } else if (Settings.includes(effects[1])) {
                props = [effects[1]]
            } else {
                throw Error(`Obfuscation setting \`${effects[1]}\` does not exist.`)
            }

            for (const scope of scopes) {
                for (const prop of props) {
                    scope[prop] = { ...scope[prop], ...options || {}, ...{ enabled: true } }
                }
            }
        }
    }

    pushBlock() { // Used to create a new nested block option, and return the old one with new global props
        const pushed = this.block
        this.block = deepCopy(this.statement)
        return (): Options => {
            const popped = this.block
            this.block = { ...pushed, ...this.global }
            return popped
        }
    }

    resetStatement() {
        const old = this.statement
        this.statement = deepCopy(this.block)
        return old
    }
}