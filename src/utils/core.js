// 处理异常，await时不用try catch
export const handlePromise = (promise) =>
  promise.then((data) => [data, null]).catch((err) => [null, err]);

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
    console.log("data:", data);
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
  let result = "";
  // fileName无后缀返回 false
  if (!suffix) {
    result = false;
    return result;
  }
  // 图片格式
  const imglist = [
    "png",
    "jpg",
    "jpeg",
    "bmp",
    "gif",
    "PNG",
    "JPG",
    "JPEG",
    "BMP",
    "GIF",
  ];
  // 进行图片匹配
  result = imglist.some((item) => item == suffix);
  if (result) {
    result = "image";
    return result;
  }
  // 匹配txt
  const txtlist = ["txt", "js"];
  result = txtlist.some((item) => item == suffix);
  if (result) {
    result = "text";
    return result;
  }
  // 匹配 excel
  const excelist = ["xls", "xlsx"];
  result = excelist.some((item) => item == suffix);
  if (result) {
    result = "excel";
    return result;
  }
  // 匹配 word
  const wordlist = ["doc", "docx"];
  result = wordlist.some((item) => item == suffix);
  if (result) {
    result = "word";
    return result;
  }
  // 匹配 pdf
  const pdflist = ["pdf"];
  result = pdflist.some((item) => item == suffix);
  if (result) {
    result = "pdf";
    return result;
  }
  // 匹配 ppt
  const pptlist = ["ppt"];
  result = pptlist.some((item) => item == suffix);
  if (result) {
    result = "ppt";
    return result;
  }
  // 匹配 视频
  const videolist = ["mp4", "m2v", "mkv"];
  result = videolist.some((item) => item == suffix);
  if (result) {
    result = "video";
    return result;
  }
  // 匹配 音频
  const radiolist = ["mp3", "wav", "wmv"];
  result = radiolist.some((item) => item == suffix);
  if (result) {
    result = "audio";
    return result;
  }
  // 其他 文件类型
  result = "other";
  return result;
}
