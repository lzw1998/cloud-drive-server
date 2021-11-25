import path from "path";
import fse from "fs-extra";
import Jimp from "jimp"; // 支持的图片压缩格式 @jpeg @/png @bmp @tiff @gif
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
  createThumbnail = async (fileName, quality, originSize) => {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = path.resolve(INPUT_IMAGE_DIR, fileName);
        const outPath = path.resolve(OUTPUT_THUMBNAIL_DIR, `${fileName}.jpg`);
        if (!(fse.existsSync(outPath) && fse.statSync(outPath).isFile())) {
          const file = fse.readFileSync(filePath);
          Jimp.read(file)
            .then(async (image) => {
              if (image._exif && image._exif.tags) {
                switch (image._exif.tags.Orientation) {
                  case 2:
                    image.flip(true, false);
                    break;
                  case 3:
                    image.rotate(180);
                    break;
                  case 4:
                    image.flip(false, true);
                    break;
                  case 5:
                    image.flip(true, false).rotate(90);
                    break;
                  case 6:
                    image.rotate(90);
                    break;
                  case 7:
                    image.flip(false, true).rotate(90);
                    break;
                  case 8:
                    image.rotate(270);
                    break;
                  default:
                    break;
                }
              }
              image
                .background(0xffffffff)
                .resize(200, Jimp.AUTO) // resize
                .quality(quality); // set JPEG quality
              let newBuffer = await image.getBufferAsync(Jimp.AUTO);
              if (newBuffer.byteLength < originSize) {
                image.write(outPath, () => {
                  resolve(true);
                });
              } else {
                console.log("compressed one largger than original one");
                resolve(false);
              }
            })
            .catch((err) => {
              console.log("err:", err);
              reject(err);
            });
        } else resolve();
      } catch (err) {
        console.log("err:", err);
        reject(err);
      }
    });
  };
  thumbnail = ({ fileHash, contentType }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (fileHash && contentType) {
          const filePath = path.resolve(OUTPUT_THUMBNAIL_DIR, `${fileHash}.jpg`);
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
