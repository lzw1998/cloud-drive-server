import path from "path";
import fse from "fs-extra";
import Jimp from "jimp";
import FileDao from "../dao/FileDao";

const INPUT_IMAGE_DIR = path.resolve(__dirname, "..", "target/files"); // 输入图片修改的目录
const OUTPUT_THUMBNAIL_DIR = path.resolve(__dirname, "..", "target/thumbnail"); // 输出图片缩略图的目录
class ThumbnailService {
  fileDao = new FileDao();
  constructor() {
    this._createDir();
  }
  _createDir = async () => {
    try {
      // 源文件目录不存在，创建源文件目录
      if (!fse.existsSync(INPUT_IMAGE_DIR)) {
        await fse.mkdirs(INPUT_IMAGE_DIR);
      }
      // 输出文件目录不存在，创建输出文件目录
      if (!fse.existsSync(OUTPUT_THUMBNAIL_DIR)) {
        await fse.mkdirs(OUTPUT_THUMBNAIL_DIR);
      }
    } catch (error) {
      console.log("error: " + error);
    }
  };
  createThumbnail = async (fileName, quality) => {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve(INPUT_IMAGE_DIR, fileName);
      const outPath = path.resolve(OUTPUT_THUMBNAIL_DIR, `${fileName}`);
      if (!(fse.existsSync(outPath) && fse.statSync(outPath).isFile())) {
        Jimp.read(filePath)
          .then((image) => {
            image
              .resize(200, 200) // resize
              .quality(quality) // set JPEG quality
              .write(outPath, () => {
                resolve();
              }); // save
          })
          .catch((err) => {
            console.log("err:", err);
            reject(err);
          });
      }
      resolve();
    });
  };
  thumbnail = ({ fileId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { doc } = await this.fileDao.findFileByFileId(fileId, "file_hash content_type", { is_thumbnailed: true });
        if (doc.fileHash) {
          const filePath = path.resolve(OUTPUT_THUMBNAIL_DIR, doc.fileHash);
          const file = fse.readFileSync(filePath);
          resolve({ file, contentType: doc.contentType });
        } else resolve();
      } catch (error) {
        console.log("error: ", error);
        reject(error);
      }
    });
  };
}

export default ThumbnailService;
