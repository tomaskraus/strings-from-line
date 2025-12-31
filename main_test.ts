import { assertEquals, assertThrows } from "@std/assert";
import { stringsFromLine } from "./main.ts";

Deno.test("Empty string results in an empty array.", () => {
  assertEquals(stringsFromLine(""), []);
});

Deno.test("Spaces are delimiters", () => {
  assertEquals(stringsFromLine("hello world"), ["hello", "world"]);
});

Deno.test("String with no spaces results in an array with one element.", () => {
  assertEquals(stringsFromLine("hello"), ["hello"]);
});

Deno.test(
  "String with only spaces (i.e. delimiters) results in an empty array.",
  () => {
    assertEquals(stringsFromLine(" "), []);
    assertEquals(stringsFromLine("  "), []);
  }
);

Deno.test("Leading/trailing delimiters are consumed without an effect.", () => {
  assertEquals(stringsFromLine(" hello "), ["hello"]);
  assertEquals(stringsFromLine(" hello world "), ["hello", "world"]);
});

Deno.test("Consecutive delimiters are consumed as one.", () => {
  assertEquals(stringsFromLine("  hello   world   "), ["hello", "world"]);
});

Deno.test(
  "Unescaped (double) quotes must be paired. Everything between them is treated as a single string, including spaces.",
  () => {
    assertEquals(stringsFromLine('"c d"'), ["c d"]);
    assertEquals(stringsFromLine('a b "c d"'), ["a", "b", "c d"]);
    assertEquals(stringsFromLine('a b "c d"  " " e'), [
      "a",
      "b",
      "c d",
      " ",
      "e",
    ]);
  }
);

Deno.test(
  "Empty quoted strings are allowed and produce empty string elements.",
  () => {
    assertEquals(stringsFromLine('""'), [""]);
    assertEquals(stringsFromLine('"" ""'), ["", ""]);
  }
);

Deno.test("Two adjacent quoted areas splits into two strings.", () => {
  assertEquals(stringsFromLine('"c d""ef"'), ["c d", "ef"]);
});

Deno.test("Quoted area are always treated as an element of its own.", () => {
  assertEquals(stringsFromLine('ab"c d"'), ["ab", "c d"]);
  assertEquals(stringsFromLine('"c d"ef'), ["c d", "ef"]);
});

Deno.test("Escaped regular character makes no difference.", () => {
  assertEquals(stringsFromLine(`\\a`), [`a`]);
  assertEquals(stringsFromLine(`\\a\\b`), [`ab`]);
});

Deno.test("Escaped space losts its stripping behavior.", () => {
  assertEquals(stringsFromLine(`a\\ b c`), [`a b`, `c`]);
  assertEquals(stringsFromLine(`a\\ b \\ d`), [`a b`, ` d`]);
});

Deno.test("Escaped quote acts as regular character.", () => {
  assertEquals(stringsFromLine(`\\"`), [`"`]);
  assertEquals(stringsFromLine(`"\\"c" "d\\"" "e\\"f"`), [`"c`, `d"`, `e"f`]);
});

Deno.test(
  "Inside a quoted area, escaped quotes act as regular characters.",
  () => {
    assertEquals(stringsFromLine(`"\\""`), [`"`]);
    assertEquals(stringsFromLine(`"a\\"b \\" "`), [`a"b " `]);
  }
);

Deno.test(
  "To use a backslash as an ordinary character in an input, just escape that backlash.",
  () => {
    assertEquals(stringsFromLine(`\\\\`), [`\\`]);
    assertEquals(stringsFromLine(`\\\\c d\\\\ e\\\\f`), [`\\c`, `d\\`, `e\\f`]);
  }
);

Deno.test(
  "To use a backslash as an ordinary character in a quoted area, just escape that backlash.",
  () => {
    assertEquals(stringsFromLine(`"\\\\"`), [`\\`]);
    assertEquals(stringsFromLine(`"\\\\c" "d\\\\" "e\\\\f"`), [
      `\\c`,
      `d\\`,
      `e\\f`,
    ]);
  }
);

Deno.test("Missing end quote throws an error.", () => {
  assertThrows(
    () => {
      stringsFromLine('"a b c');
    },
    Error,
    "Unmatched quote"
  );
});

Deno.test("Incomplete escape sequence throws an error.", () => {
  assertThrows(
    () => {
      stringsFromLine("a b c\\");
    },
    Error,
    "incomplete escape sequence"
  );
});

Deno.test(
  "Incomplete escape sequence in a quoted area throws an error.",
  () => {
    assertThrows(
      () => {
        stringsFromLine(`a b "c\\`);
      },
      Error,
      "incomplete escape sequence"
    );
  }
);
