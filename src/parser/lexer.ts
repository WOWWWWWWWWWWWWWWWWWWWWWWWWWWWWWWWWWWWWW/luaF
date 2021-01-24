// deno-lint-ignore-file no-cond-assign
import { StreamedToken, Token, TokenType } from './types/Token.ts';

// Golfing because I don't like you :-)

/*
const EscapeForCharacter = {
    '\r': '\\r', 
    '\n': '\\n', 
    '\t': '\\t', 
    '"': '\\"', 
    "'": "\\'", 
    '\\': '\\'
}

const CharacterForEscape = {
    'r': '\r', 
    'n': '\n', 
    't': '\t',
    '"': '"', 
    "'": "'", 
    '\\': '\\'
}


const AllIdentStartChars = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 
                                     'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 
                                     's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                                     'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
                                     'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 
                                     'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_'])

const AllIdentChars = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 
                                'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 
                                's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 
                                'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 
                                'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_',
                                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
*/

const Keywords = new Set(['and', 'break', 'do', 'else', 'elseif',
    'end', 'false', 'for', 'function', 'goto', 'if',
    'in', 'local', 'nil', 'not', 'or', 'repeat',
    'return', 'then', 'true', 'until', 'while'])

const Symbols = new Set(['+', '-', '*', '/', '^', '%', ',', '{', '}', '[', ']', '(', ')', ';', '#', '.', ':'])

const MatchEvenBackslashes = /(?<!\\)(?:\\\\)*(?!\\)/
const MatchOddBackslashes = /(?<!\\)\\(?:\\\\)*(?!\\)/

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
    function longdata(eqcount: number) {
        const m = match(new RegExp(`.+?]={${eqcount}}]`)) // eqcount 1: .+?]={1}] | eqcount 3: .+?]={3}]
        m ? p += m[0].length : panic("Unfinished long string.")
    }

    let whiteStart = 0
    let tokenStart = 0
    const token = (type: TokenType) =>
        tokenBuffer.push(
            new StreamedToken(
                type,
                input.substring(tokenStart, p),
                input.substring(whiteStart, tokenStart)
            )
        )

    // Main lexer loop
    while (true) {
        // Mark the whitespace start
        whiteStart = p

        // Get the leading whitespace + comments
        while (true) {
            let m: RegExpMatchArray | null;
            if (p >= length) { // eof
                break
            } else if (m = match(/--(\[(=*)\[)?/)) {
                // Comments, first group possibly matches [[ and [==[, second group matches equals
                if (m[1]) { // Long comment if there is a first group
                    p += m[0].length
                    longdata(m[2].length)
                } else {
                    // Normal, consume until newline or eof
                    const m1 = match(/.+?(?:\n|$)/)
                    m1 ? p += m1[0].length : panic("something happened while consuming normal comment")
                }
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
                for (const invalid of content.matchAll(new RegExp(`${MatchOddBackslashes.source}${/([^\\drnt"'\\\\])/.source}`, "g"))) {
                    panic(`Letter escape \\${invalid[1]} is not allowed.`)
                }

                // Replace foldable ascii escapes
                const replaced = input.substr(tokenStart + 1, m[0].length + 1)
                    .replace(
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
        } else if (m = match(/[a-zA-Z]\w*/)) {
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