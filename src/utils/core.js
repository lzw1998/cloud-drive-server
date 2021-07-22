// 处理异常，await时不用try catch
export const handlePromise = (promise) => promise.then((data) => [data, null]).catch((err) => [null, err]);

// 处理请求路径和controller映射
export const mapping = (func) => {
  return async (ctx, next) => {
    const data = await func(ctx);
    ctx.response.status = data.code;
    ctx.body = data;
  };
};

// 下划线转为驼峰命名
export const toHump = (obj) => {
  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const element = obj[key];
      const index = key.indexOf("_");
      let newKey = key;
      if (index === -1 || key.length === 1) {
        result[key] = element;
      } else {
        const keyArr = key.split("_");
        const newKeyArr = keyArr
          .filter((item) => item !== "")
          .map((item, index) => {
            if (index === 0) return item;
            return item.charAt(0).toLocaleUpperCase() + item.slice(1);
          });
        newKey = newKeyArr.join("");
        result[newKey] = element;
      }

      if (typeof element === "object" && element !== null) {
        result[newKey] = toHump(element);
      }
    }
  }
  return result;
};
