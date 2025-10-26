export const pathToParams = (
  route: string,
  path: string,
): Record<string, string | string[]> | undefined => {
  const expression = `^${route
    .replace(/\//g, "\\/")
    .replace(
      /(^|\\\/)\[\[\.\.\.[^.\]]+\]\]/g,
      (_, s) => (s && "([/][^.]+|\\/?)") || "([^.]*)",
    )
    .replace(/(?<=^|\/)\[\.\.\.[^.\]]+\]/g, "([^.]+)")
    .replace(/(?<=^|\/)\[.*?\]/g, "([^/]+)")}$`;
  const paramNames = route.split("/").filter((part) => part.startsWith("["));
  const match = new RegExp(expression).exec(path);
  if (!match) {
    return undefined;
  }
  return match.slice(1).reduce(
    (acc, param, index) => ({
      ...acc,
      [paramNames[index].replace(/(^\[\[?(\.\.\.)?|\]?\]$)/g, "")]: paramNames[
        index
      ].startsWith("[[...")
        ? (param.replace(/^\//g, "") || undefined)?.split("/")
        : (paramNames[index].startsWith("[...") && param.split("/")) || param,
    }),
    {} as Record<string, string | string[]>,
  );
};

export const paramsToPath = (
  route: string,
  params: Record<string, string | string[]>,
): string => {
  return route.replace(/(^|\/)\[[^\]]+\]?\]/g, (match, s) => {
    const paramName = match.replace(/((^|\/)\[\[?(\.\.\.)?|\]?\]$)/g, "");
    const value =
      params[paramName] instanceof Array
        ? params[paramName].join("/")
        : params[paramName];
    return (value && s + value) || "";
  });
};
