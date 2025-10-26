export const cleanObject = (obj: any) => {
  if (typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Array) {
    const cleaned = obj
      .map(cleanObject)
      .filter((v) => ![null, undefined].includes(v));
    return cleaned.length ? cleaned : undefined;
  } else {
    const cleaned = Object.entries(obj)
      .map(([key, value]) => [key, cleanObject(value)])
      .filter((e) => ![null, undefined].includes(e[1]));
    return cleaned.length ? Object.fromEntries(cleaned) : undefined;
  }
};
