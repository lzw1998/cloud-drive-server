// 处理异常，await时不用try catch
export const handlePromise = (promise) => promise.then((data) => [data, null]).catch((err) => [null, err]);

// 处理请求路径和controller映射
export const mapping = (func) => {
  return async (ctx) => {
    const data = await func(ctx);
    ctx.response.status = data.code;
    ctx.body = data;
  };
};

// 处理请求路径和controller映射
export const staticMapping = (func) => {
  return async (ctx) => {
    const { data, contentType } = await func(ctx);
    ctx.set("content-type", contentType);
    ctx.response.status = data.code || 200;
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

export const extractExt = (fileName) => {
  if (fileName.lastIndexOf(".") > 0) {
    return fileName.slice(fileName.lastIndexOf(".") + 1, fileName.length);
  } else return "";
};

export function matchFileType(suffix) {
  console.log(suffix);
  const match = {
    // 多媒体文件
    image: ["png", "jpg", "jpeg", "bmp", "gif", "tiff", "tif"],
    audio: ["mp3", "wav", "wmv"],
    video: ["mp4", "m2v", "mkv"],
    // 办公
    pdf: ["pdf"],
    word: ["doc", "docx"],
    excel: ["xls", "xlsx"],
    ppt: ["ppt", "pptx"],
    // 压缩包
    zip: ["7z", "zip", "rar", "apk"],
    // adobe
    ai: ["ai"],
    psd: ["psd"],
    // code
    js: ["js", "jsx", "vue"],
    css: ["css", "less", "sass", "scss"],
    html: ["html"],
    xml: ["xml"],
    json: ["json"],
    text: ["text"],
  };
  for (let key in match) {
    if (match[key].indexOf(suffix) !== -1) return key;
  }
  return "other";
}
