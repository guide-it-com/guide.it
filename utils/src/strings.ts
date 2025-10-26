// try to parse a string as JSON
export const tryJsonParse = <T = any>(
  str: string | undefined,
): T | undefined => {
  try {
    return str ? (JSON.parse(str) as T) : undefined;
  } catch (e) {
    return undefined;
  }
};

// extract the first group matched string from a RegExp
export const getFirstGroupMatch = (str: string, re: RegExp) => {
  const match = re.exec(str);
  if (match === null) {
    return "";
  }
  return match[1];
};
