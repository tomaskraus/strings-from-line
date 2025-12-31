/**
 * Reads the first line from a ReadableStream.
 * @param readable a readableStream object
 * @returns The first line from the stream. Not including the EOL character.
 */
export const readFirstLine = async (
  readable: ReadableStream
): Promise<string> => {
  const decoder = new TextDecoder();
  let output = "";
  for await (const chunk of readable) {
    const text = decoder.decode(chunk);
    output += text;
    if (text.includes("\n")) {
      break;
    }
  }

  return output
    .concat("\n")
    .slice(0, Math.min(output.length, output.indexOf("\n")));
};
