import { Block } from "../../parser/types/Base.ts";
import { Scope } from "../../variableInfo/Scope.ts";
import { Global } from "../../variableInfo/Variable.ts";

import identifierRenaming from "./identifierRenaming/index.ts";

export default [
    identifierRenaming
] as ((root: Block, globals: Global[], rootScope: Scope) => Block)[]