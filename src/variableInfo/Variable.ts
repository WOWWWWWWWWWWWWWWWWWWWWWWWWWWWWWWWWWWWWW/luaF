import { Options } from "../parser/types/Context.ts"
import { markLocation } from "./index.ts"
import { Scope } from "./Scope.ts"

export enum LocalType {
    Local,
    Argument,
    LocalFunction,
    ForRange
}

export interface VariableInfo {
    type: LocalType,
    index?: number
}

export type NameFunc = (newName: string) => void
export abstract class Variable {
    name: string

    abstract renameList: NameFunc[]
    assignedTo = false

    beginLocation: number
    endLocation: number
    scopeEndLocation = 0
    abstract referenceLocationList: number[]

    options: Options | null

    constructor(name: string, options: Options | null) {
        this.name = name
        this.options = options

        this.beginLocation = markLocation()
        this.endLocation = markLocation()
    }

    rename(newName: string) {
        this.name = newName
        this.renameList.forEach(f => f(newName))
    }

    reference(nameFunc: NameFunc) {
        this.renameList.push(nameFunc)

        this.endLocation = markLocation()
        this.referenceLocationList.push(this.endLocation)
    }
}

export class Global extends Variable {
    referenceLocationList: number[] = []
    renameList: NameFunc[] = []
}

export class Local extends Variable {
    referenceLocationList: number[]
    renameList: NameFunc[]

    scope: Scope
    info: VariableInfo

    constructor(name: string, options: Options, info: VariableInfo, scope: Scope, nameFunc: NameFunc) {
        super(name, options)
        this.renameList = [nameFunc]

        this.info = info
        this.scope = scope

        this.referenceLocationList = [markLocation()]
    }
}