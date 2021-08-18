function matchFileType(suffix) {
  const match = {
    // 多媒体文件
    image: ["png", "jpg", "jpeg", "bmp", "gif", "PNG", "JPG", "JPEG", "BMP", "GIF"],
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
console.log(matchFileType("xls"));
