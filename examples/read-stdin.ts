import { readFirstLine } from "./utils/read-first-line.ts";
import { stringsFromLine } from "../main.ts";

const s = await readFirstLine(Deno.stdin.readable);
console.log("INPUT: ", `(${s})`);
console.log("RESULT:", stringsFromLine(s));
