import lexer from "./lexer.ts";

export default function parse(input: string) {
    console.log(lexer(input));
}