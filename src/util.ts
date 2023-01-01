// break string into lines on word boundaries
export const wrapLines = (str, width) => {
  const words = str.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word, i) => {
    if (line.length + word.length > width) {
      lines.push(line);
      line = "";
    }
    line += word + " ";
    if (i === words.length - 1) {
      lines.push(line);
    }
  });
  return lines;
};
