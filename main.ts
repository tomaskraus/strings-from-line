/**
 * A module providing a function to split strings while respecting quoted substrings.
 * You can also escape spaces and quotes using backslashes.
 *
 * Useful if you need to parse command-line-like input. Argv style.
 * @module
 */

/**
 * Splits an input string into an array of strings, using spaces as delimiters, while respecting quoted substrings. You can also escape spaces and quotes using backslashes.
 * @param line - An input string.
 * @returns An array of strings as a result of input string being split by the delimiter (a space character by default). Quoted areas in the input string (enclosed in double quotes) are treated as single elements, even if they contain spaces.
 *
 * @example
 *
 * ```ts
 * import { stringsFromLine } from "./main.ts";
 *
 * const result = stringsFromLine('Hello world "as is..."');
 * console.log(result); // ['Hello', 'world', 'as is...']
 * ```
 *
 * @throws {Error} If there are unmatched quotes or incomplete escape sequences.
 */
export function stringsFromLine(line: string): string[] {
  type State = "normal" | "inQuotes" | "escaped" | "escapedInQuotes";

  let currentString = "";
  let currentState: State = "normal";
  const result: string[] = [];

  const addChar = (ch: string) => {
    currentString += ch;
  };

  const flushCurrent = () => {
    result.push(currentString);
    currentString = "";
  };

  const flushCurrentNonEmpty = () => {
    if (currentString.length > 0) {
      flushCurrent();
    }
  };

  type Action = [((char: string) => void) | null, State];

  interface StateTransition {
    actions: { [key: string]: Action };
    defaultAction: Action;
  }

  const STATE_TABLE: { [key in State]: StateTransition } = {
    normal: {
      actions: {
        " ": [flushCurrentNonEmpty, "normal"],
        '"': [flushCurrentNonEmpty, "inQuotes"],
        "\\": [null, "escaped"],
      },
      defaultAction: [addChar, "normal"],
    },
    inQuotes: {
      actions: {
        '"': [flushCurrent, "normal"],
        "\\": [null, "escapedInQuotes"],
      },
      defaultAction: [addChar, "inQuotes"],
    },
    escaped: {
      actions: {},
      defaultAction: [addChar, "normal"],
    },
    escapedInQuotes: {
      actions: {},
      defaultAction: [addChar, "inQuotes"],
    },
  };

  for (const char of line) {
    const transition: StateTransition = STATE_TABLE[currentState];
    const [action, nextState] =
      transition.actions[char] || transition.defaultAction;
    if (action) action(char);
    currentState = nextState;
  }

  if (currentState === "inQuotes") throw new Error("Unmatched quote");
  if (currentState === "escaped" || currentState === "escapedInQuotes")
    throw new Error("incomplete escape sequence");

  flushCurrentNonEmpty();

  return result;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const psl = (str: string) => {
    let res = [""];
    try {
      res = stringsFromLine(str);
      console.log(`${str}:`, res);
    } catch (e) {
      console.log(`${str}: ERROR:`, (e as Error).message);
    }
  };

  psl('"a b cd":');
  psl(`'a b "c \\" d"'`);
  psl(`'a b c\\ d`);
  psl(`ab"c d"`);
  psl(`"c d"ef`);

  psl(`'a b "c`);
  psl(`'a b c\\`);
  psl(`'a b "c\\`);
}
