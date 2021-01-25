import { Block } from "../../../parser/types/Base.ts";
import { Scope } from "../../../variableInfo/Scope.ts";
import { Global, Local, Variable } from "../../../variableInfo/Variable.ts";
import { getMapping } from "./renamers/index.ts";

import renamers from "./renamers/index.ts"
import { Options } from "../../../parser/types/Context.ts";

export default function (root: Block, globals: Global[], rootScope: Scope) {
    /*
        Variable names and other names that are fixed, that we cannot use
        Either these are Lua keywords, or globals that are not assigned to,
        that is environmental globals that are assigned elsewhere beyond our
        control.
    */

    const globalUsedNames = new Set([
        'and', 'break', 'do', 'else', 'elseif',
        'end', 'false', 'for', 'function', 'goto', 'if',
        'in', 'local', 'nil', 'not', 'or', 'repeat',
        'return', 'then', 'true', 'until', 'while'
    ])

    type UsedNames = {
        usedNameArray: boolean[]
    }

    // Gather a list of all of the variables that we will rename
    const allVariables: (Variable & UsedNames)[] = []

    // Add applicable globals
    globals.forEach(g => {
        if (g.assignedTo && g.options?.identifierRenaming.renameGlobals) {
            /*
                We can try to rename this global since it was assigned to
                (and thus presumably initialized) in the script we are
                minifying.
            */
            allVariables.push(g as Global & UsedNames)
        } else {
            globalUsedNames.add(g.name)
        }
    })

    // Recursively add locals, we can rename all of those
    function addFrom(scope: Scope) {
        for (const v of scope.variableList) {
            allVariables.push(v as Local & UsedNames)
        }

        scope.childScopeList.forEach(s => addFrom(s))
    }
    addFrom(rootScope)

    // Lazy generator for valid names to rename to
    let nextValidNameIndex = 0
    const varNamesLazy: string[] = []
    function varIndexToValidVarName(options: Options, i: number): string {
        const opts = options.identifierRenaming
        const indexToVarName = renamers[opts.mode || "alphabet"]

        if (!indexToVarName) throw new Error(`Renamer "${opts.mode}" does not exist.`);

        let name = varNamesLazy[i]
        if (!name) {
            do {
                if (opts.increment) {
                    name = indexToVarName(nextValidNameIndex++)
                } else {
                    name = indexToVarName(getMapping(nextValidNameIndex++))
                }
            } while (globalUsedNames.has(name));
            varNamesLazy[i] = name
        }
        return name
    }

    // Initialize usedNameArray
    allVariables.forEach(v => v.usedNameArray = [])

    for (let j = 0; j < allVariables.length; j++) {
        const v = allVariables[j];
        console.log(v.name)

        // Find the first unused name
        let i = 0
        while (v.usedNameArray[i]) { i++ }

        const opts = v.options
        if (!opts || !opts.identifierRenaming.enabled)
            continue;


        // Rename the variable to that name
        v.rename(varIndexToValidVarName(opts, i))

        if (v instanceof Local) {
            // Now we need to mark the name as unusable by any variables:
            /*
                1) At the same depth that overlap lifetime with this one
                2) At a deeper level, which have a reference to this variable in their lifetimes
                3) At a shallower level, which are referenced during this variable's lifetime
            */
            for (const otherVar of allVariables.slice(j + 1)) {
                if (!(otherVar instanceof Local) || otherVar.scope.depth < v.scope.depth) {
                    /*  
                        Check Global variable (Which is always at a shallower level)
                        or
                        Check case 3
                        The other var is at a shallower depth, is there a reference to it
                        durring this variable's lifetime?
                    */
                    for (const refAt of otherVar.referenceLocationList) {
                        if (refAt >= v.beginLocation && refAt <= v.scopeEndLocation) {
                            // Lifetimes match, collision will happen, disallow this variable use
                            otherVar.usedNameArray[i] = true
                            break
                        }
                    }
                } else if (otherVar.scope.depth > v.scope.depth) {
                    // Check Case 2
                    // The other var is at a greater depth, see if any of the references
                    // to this variable are in the other var's lifetime.
                    for (const refAt of v.referenceLocationList) {
                        if (refAt >= otherVar.beginLocation && refAt <= otherVar.scopeEndLocation) {
                            // Lifetimes match, collision will happen, disallow this variable use
                            otherVar.usedNameArray[i] = true
                            break
                        }
                    }
                } else { // otherVar.scope.depth must be equal to v.scope.depth
                    /*
                        Check case 1
                        The two locals are in the same scope
                        Just check if the usage lifetimes overlap within that scope. That is, we
                        can shadow a local variable within the same scope as long as the usages
                        of the two locals do not overlap.
                    */
                    if (v.beginLocation < otherVar.endLocation && v.endLocation > otherVar.beginLocation) {
                        otherVar.usedNameArray[i] = true
                    }
                }
            }
        } else {
            console.log("global")
            /*
                This is a global var, all other globals can't collide with it, and
                any local variable with a reference to this global in it's lifetime
                can't collide with it.
            */

            for (const otherVar of allVariables.slice(j + 1)) {
                if (otherVar instanceof Global) {
                    otherVar.usedNameArray[i] = true
                } else if (otherVar instanceof Local) {
                    // Other var is a local, see if there is a reference to this global within
                    // that local's lifetime.
                    for (const refAt of v.referenceLocationList) {
                        if (refAt >= otherVar.beginLocation && refAt <= otherVar.scopeEndLocation) {
                            // Lifetimes match, collision will happen, disallow this variable use
                            otherVar.usedNameArray[i] = true
                            break
                        }
                    }
                } else {
                    throw new Error("unreachable");
                }
            }
        }
    }

    return root
}