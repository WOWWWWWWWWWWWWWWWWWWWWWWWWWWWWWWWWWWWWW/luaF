// deno-lint-ignore-file no-cond-assign
import { MatchEvenBackslashes, MatchOddBackslashes, Keywords, Symbols } from '../utils/constants.ts';
import { StreamedToken, TokenType } from './types/Token.ts';

export function lexer(input: string): StreamedToken[] {
    let p = 0
    let length = input.length

    const tokenBuffer: StreamedToken[] = []

    function panic(msg: string): never {
        const text = input.substring(0, p);
        const line = text.split("\n").length;
        let char = p; text.split("\n").forEach(s => char -= s.length);
        console.log(tokenBuffer)
        throw new Error(`file<${line}:${char}>: ${msg}`)
    }

    const match = (r: RegExp) => input.substring(p).match(new RegExp(`^(?:${r.source})`, r.flags))

    // Consume a long data with equals count of `eqcount'
    function longdata(eqcount: number): string {
        const m = match(new RegExp("(.*?)]={" + eqcount + "}]", "s"))
        if (m) {
            p += m[0].length
            return m[1]
        }
        panic("Unfinished long string.")
    }

    let whiteStart = 0
    let tokenStart = 0
    let comments: string[] = []

    const token = (type: TokenType) =>
        tokenBuffer.push(
            new StreamedToken(
                type,
                input.substring(tokenStart, p),
                input.substring(whiteStart, tokenStart),
                comments
            )
        )

    // Main lexer loop
    while (true) {
        comments = []
        // Mark the whitespace start
        whiteStart = p

        // Get the leading whitespace + comments
        while (true) {
            let m: RegExpMatchArray | null;
            if (p >= length) { // eof
                break
            } else if (m = match(/--(\[(=*)\[)?/)) {
                // Comments, first group possibly matches [[ and [==[, second group matches equals
                p += m[0].length
                const commentStart = p
                let commentEnd;
                if (m[1]) { // Long comment if there is a first group
                    commentEnd = commentStart + longdata(m[2].length).length
                } else {
                    // Normal, consume until newline or eof
                    const m1 = match(/.*?$/m)
                    m1 ? p += m1[0].length : panic("something happened while consuming normal comment")
                    commentEnd = p
                }
                comments.push(input.substring(commentStart, commentEnd))
            } else if (m = match(/\s+/)) {
                p += m[0].length
            } else {
                break
            }
        }

        // const leadingWhite = input.substring(whiteStart, p-1)

        tokenStart = p

        let m: RegExpMatchArray | null;
        if (p >= length) { // eof
            token(TokenType.Eof);
            break
        } else if (m = match(new RegExp(`"(.*?${MatchEvenBackslashes.source})"` + "|" + `'(.*?${MatchEvenBackslashes.source})'`))) { // match quote with next quote with an even number of preceding backslashes (including zero)
            // Get invalid letter escapes
            const content = m[1] || m[2]
            if (content) {
                for (const invalid of content.matchAll(new RegExp(`${MatchOddBackslashes.source}${/([^\drnt"'\\])/.source}`, "g"))) {
                    panic(`Letter escape \\${invalid[1]} is not allowed.`)
                }

                // Replace foldable ascii escapes
                const replaced = input.substr(tokenStart + 1, m[0].length + 1)
                    .replaceAll(
                        /\\(\d{2,3})/g,
                        (w, n) => n > 31 && n < 127 ? String.fromCharCode(n) : w
                    ) // lmao
                input = input.substring(0, tokenStart + 1) + replaced + input.substring(tokenStart + m[0].length + 2)
                // p -= length - input.length
                length = input.length

                p += replaced.length - 1
            } else {
                p += m[0].length
            }

            token(TokenType.String)
        } else if (m = match(/[a-zA-Z_]\w*/)) {
            p += m[0].length
            token(Keywords.has(m[0]) ? TokenType.Keyword : TokenType.Ident)
        } else if (m = match(/0x[\da-fA-F]+|\d+(?:E|e)-?\d+|\d*\.?\d+/)) {
            p += m[0].length
            token(TokenType.Number)
        } else if (m = match(/\[(=*)\[/)) {
            // Long string
            p += m[0].length
            longdata(m[1].length)
            token(TokenType.String)
        } else if (m = match(/\.{1,3}/)) { // Greedily consume up to 3 `.` for . / .. / ... tokens
            p += m[0].length
            token(TokenType.Symbol)
        } else if (m = match(/[~=><]=?/)) {
            p += m[0].length
            token(TokenType.Symbol)
        } else if (Symbols.has(input.charAt(p))) {
            p++
            token(TokenType.Symbol)
        } else {
            panic(`Unexpected character \`${input.substring(p)}\``)
        }
    }

    return tokenBuffer;
}