import fse from "fs-extra";
import archiver from "archiver";
import path from "path";

const UPLOAD_FILE_DIR = path.resolve(__dirname, "..", "target/files"); // 大文件存储目录

export const packDownload = (files) => {
  return new Promise(async (resolve, reject) => {
    try {
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });
      // archive.on("warning", function (err) {
      //   if (err.code === "ENOENT") {
      //     console.log("warning");
      //   } else {
      //     // throw error
      //     console.log("error:", err);
      //     throw err;
      //   }
      // });
      // archive.on("progress", function (entries) {
      //   console.log(entries);
      // });

      files.forEach((item) => {
        if (item.type === "folder") archive.append("", { name: `${item.name}/` });
        else if (!item.fileHash) {
          archive.append("", { name: `${item.name}` });
        } else {
          const file1 = `${UPLOAD_FILE_DIR}/${item.fileHash}`;
          archive.append(fse.createReadStream(file1), { name: `${item.name}` });
        }
      });
      // archive.finalize();
      resolve(archive);
    } catch (error) {
      console.log("error: ", error);
      reject(error);
    }
  });

  console.log("打包完成");
};
