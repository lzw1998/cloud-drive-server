import path from "path";
import send from "koa-send";

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
    const doc = await func(ctx);
    const { data, contentType } = doc;
    ctx.set("content-type", contentType);
    ctx.response.status = data.code || 200;
    ctx.body = data;
  };
};

// 处理请求路径和controller映射
export const downloadMapping = (func) => {
  return async (ctx, res) => {
    const { data } = await func(ctx);
    let filePath = "";
    if (data.type === "single") {
      filePath = path.resolve("/src/target/files/", data.fileHash);
      ctx.response.attachment(data.name);
      if (data.fileHash) {
        await send(ctx, filePath);
      } else {
        ctx.body = "";
      }
    } else if (data.type === "multi") {
      ctx.response.attachment(data.name);
      ctx.body = data.archive;
      data.archive.finalize();
    }
  };
};

export const formatHumpLineTransfer = (data, type = "hump") => {
  const formatToHump = (value) => {
    return value.replace(/\_(\w)/g, (_, letter) => letter.toUpperCase());
  };

  const formatToLine = (value) => {
    return value.replace(/([A-Z])/g, "_$1").toLowerCase();
  };
  let hump = "";
  let formatTransferKey = (data) => {
    if (data instanceof Array) {
      data.forEach((item) => formatTransferKey(item));
    } else if (data instanceof Object) {
      for (let key in data) {
        hump = type === "hump" ? formatToHump(key) : formatToLine(key);
        data[hump] = data[key];
        if (key !== hump) {
          delete data[key];
        }
        if (data[hump] instanceof Object) {
          formatTransferKey(data[hump]);
        }
      }
    } else if (typeof data === "string") {
      data = type === "hump" ? formatToHump(data) : formatToLine(data);
    }
  };
  formatTransferKey(data);
  return data;
};

// 获取文件扩展名
export const extractExt = (fileName) => {
  if (fileName.lastIndexOf(".") > 0) {
    return fileName.slice(fileName.lastIndexOf(".") + 1, fileName.length);
  } else return "";
};

// 根据文件扩展名获得文件类型
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
    text: ["txt"],
  };
  for (let key in match) {
    if (match[key].indexOf(suffix) !== -1) return key;
  }
  return "other";
}

// 将字符串转义
export function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

// 根据对象属性进行分组
// export function groupBy(arr, f) {
//   let groups = {};
//   arr.forEach((item) => {
//     let key = JSON.stringify(f(item));
//     groups[key] = groups[key] || [];
//     groups[key].push(item);
//   });
//   return Object.keys(groups).map((key) => {
//     return groups[key];
//   });
// }
