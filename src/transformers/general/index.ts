import { Block } from "../../parser/types/Base.ts";

import removeDuplicateLiterals from "./removeDuplicateLiterals.ts"
import tweakNumberNotation from "./tweakNumberNotation.ts"
import variableGrouping from "./variableGrouping.ts";
import obnoxiousStringLiterals from "./obnoxiousStringLiterals.ts";

export default [
    removeDuplicateLiterals,
    variableGrouping,
    tweakNumberNotation,
    obnoxiousStringLiterals
] as ((root: Block) => Block)[]