export const Keywords = new Set(['and', 'break', 'do', 'else', 'elseif',
    'end', 'false', 'for', 'function', 'goto', 'if',
    'in', 'local', 'nil', 'not', 'or', 'repeat',
    'return', 'then', 'true', 'until', 'while'])

export const Symbols = new Set(['+', '-', '*', '/', '^', '%', ',', '{', '}', '[', ']', '(', ')', ';', '#', '.', ':'])

export const MatchEvenBackslashes = /(?<!\\)(?:\\\\)*(?!\\)/
export const MatchOddBackslashes = /(?<!\\)\\(?:\\\\)*(?!\\)/