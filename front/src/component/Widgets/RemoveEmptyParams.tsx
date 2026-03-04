const removeEmptyParams = (params: any) => {
  const result: Record<string, any> = {};

  const keys = Object.keys(params);
  keys.forEach((key) => {
    if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
      result[key] = params[key];
    }
  });

  return result;
};

export default removeEmptyParams;
