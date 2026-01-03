import { assertEquals, assertThrows } from "@std/assert";
import { stringsFromLine } from "./main.ts";

Deno.test("Basic splitting.", async (t) => {
  await t.step("Empty string results in an empty array.", () => {
    assertEquals(stringsFromLine(""), []);
  });

  await t.step("Spaces are delimiters", () => {
    assertEquals(stringsFromLine("hello world"), ["hello", "world"]);
  });

  await t.step(
    "String with only spaces (i.e. delimiters) results in an empty array.",
    () => {
      assertEquals(stringsFromLine(" "), []);
      assertEquals(stringsFromLine("  "), []);
    }
  );

  await t.step(
    "Leading/trailing delimiters are consumed without an effect.",
    () => {
      assertEquals(stringsFromLine(" hello "), ["hello"]);
      assertEquals(stringsFromLine(" hello world "), ["hello", "world"]);
    }
  );

  await t.step("Consecutive delimiters are consumed as one.", () => {
    assertEquals(stringsFromLine("  hello   world   "), ["hello", "world"]);
  });

  await t.step(
    "String with no spaces results in an array with one element.",
    () => {
      assertEquals(stringsFromLine("hello"), ["hello"]);
    }
  );
});

Deno.test("Double quotes processing.", async (t) => {
  await t.step(
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
  await t.step(
    "Empty quoted strings are allowed and produce empty string elements.",
    () => {
      assertEquals(stringsFromLine('""'), [""]);
      assertEquals(stringsFromLine('"" ""'), ["", ""]);
    }
  );
});

Deno.test("Adjacent quoted/unquoted areas", async (t) => {
  await t.step("Two adjacent quoted areas result in one string.", () => {
    assertEquals(stringsFromLine('"c d""ef"'), ["c def"]);
    assertEquals(stringsFromLine('""""'), [""]);
  });
  await t.step(
    "Adjacent quoted area and unquoted one result in one string.",
    () => {
      assertEquals(stringsFromLine('cd"ef"'), ["cdef"]);
      assertEquals(stringsFromLine('"e f"gh'), ["e fgh"]);
    }
  );
});

Deno.test("Escaping with backslashes.", async (t) => {
  await t.step("Escaped regular character makes no difference.", () => {
    assertEquals(stringsFromLine(`\\a`), [`a`]);
    assertEquals(stringsFromLine(`\\a\\b`), [`ab`]);
  });

  await t.step("Escaped space losts its stripping behavior.", () => {
    assertEquals(stringsFromLine(`a\\ b c`), [`a b`, `c`]);
    assertEquals(stringsFromLine(`a\\ b \\ d`), [`a b`, ` d`]);
  });

  await t.step("Escaped quote acts as regular character.", () => {
    assertEquals(stringsFromLine(`\\"`), [`"`]);
    assertEquals(stringsFromLine(`"\\"c" "d\\"" "e\\"f"`), [`"c`, `d"`, `e"f`]);
  });

  await t.step(
    "Inside a quoted area, escaped quotes act as regular characters.",
    () => {
      assertEquals(stringsFromLine(`"\\""`), [`"`]);
      assertEquals(stringsFromLine(`"a\\"b \\" "`), [`a"b " `]);
    }
  );
});

Deno.test("Unescaping.", async (t) => {
  await t.step(
    "To use a backslash as an ordinary character in an input, just escape that backlash.",
    () => {
      assertEquals(stringsFromLine(`\\\\`), [`\\`]);
      assertEquals(stringsFromLine(`\\\\c d\\\\ e\\\\f`), [
        `\\c`,
        `d\\`,
        `e\\f`,
      ]);
    }
  );

  await t.step(
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
});

Deno.test("Error handling.", async (t) => {
  await t.step("Missing end quote throws an error.", () => {
    assertThrows(
      () => {
        stringsFromLine('"a b c');
      },
      Error,
      "Unmatched quote"
    );
  });

  await t.step("Incomplete escape sequence throws an error.", () => {
    assertThrows(
      () => {
        stringsFromLine("a b c\\");
      },
      Error,
      "incomplete escape sequence"
    );
  });

  await t.step(
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
});
