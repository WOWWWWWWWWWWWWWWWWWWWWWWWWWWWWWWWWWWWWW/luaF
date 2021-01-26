import { Block } from "@ast/Base"
import { Scope } from "../../variableInfo/Scope"
import { Global } from "../../variableInfo/Variable"

import identifierRenaming from "./identifierRenaming"

export default [identifierRenaming] as ((
	root: Block,
	globals: Global[],
	rootScope: Scope
) => Block)[]
