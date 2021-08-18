import path from "path";
import fse from "fs-extra";
import Jimp from "jimp"; // 支持的图片压缩格式 @jpeg @/png @bmp @tiff @gif
import FileDao from "../dao/FileDao";
import exifr from "exifr";
import { rotate } from "jimp";

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
  createThumbnail = async (fileName, quality, originSize) => {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve(INPUT_IMAGE_DIR, fileName);
      const outPath = path.resolve(OUTPUT_THUMBNAIL_DIR, `${fileName}`);
      if (!(fse.existsSync(outPath) && fse.statSync(outPath).isFile())) {
        Jimp.read(filePath)
          .then(async (image) => {
            let rotation = await exifr.rotation(filePath);
            image
              .resize(200, Jimp.AUTO) // resize
              .flip(rotation.scaleX < 0, rotation.scaleY < 0)
              .rotate(rotation.deg || 0)
              .quality(quality); // set JPEG quality
            let newBuffer = await image.getBufferAsync(Jimp.AUTO);
            if (newBuffer.byteLength < originSize) {
              image.write(outPath, () => {
                resolve();
              });
            } else {
              return reject("compressed one largger than original one");
            }
          })
          .catch((err) => {
            console.log("err:", err);
            reject(err);
          });
      } else resolve();
    });
  };
  thumbnail = ({ fileHash, contentType }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (fileHash && contentType) {
          const filePath = path.resolve(OUTPUT_THUMBNAIL_DIR, fileHash);
          const file = fse.readFileSync(filePath);
          resolve({ file, contentType });
        } else resolve();
      } catch (error) {
        console.log("error: ", error);
        reject(error);
      }
    });
  };
}

export default ThumbnailService;
