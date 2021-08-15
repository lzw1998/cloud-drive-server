import { nanoid } from "nanoid";
import multiparty from "multiparty";
import path from "path";
import fse from "fs-extra";

import FileDao from "../dao/FileDao";
import ThumbnailService from "./ThumbnailService";

const UPLOAD_FILE_DIR = path.resolve(__dirname, "..", "target/files"); // 大文件存储目录
const UPLOAD_CHUNK_DIR = path.resolve(__dirname, "..", "target/chunks"); // 大文件存储缓存块目录

class FileService {
  fileDao = new FileDao();
  thumbnailService = new ThumbnailService();
  constructor() {
    this._createDir();
  }
  _createDir = async () => {
    // 切片目录不存在，创建切片目录
    if (!fse.existsSync(UPLOAD_CHUNK_DIR)) {
      await fse.mkdirs(UPLOAD_CHUNK_DIR);
    }
    // 文件目录不存在，创建文件目录
    if (!fse.existsSync(UPLOAD_FILE_DIR)) {
      await fse.mkdirs(UPLOAD_FILE_DIR);
    }
  };
  // 返回已经上传切片名
  _createUploadedList = async (fileHash) =>
    fse.existsSync(path.resolve(UPLOAD_CHUNK_DIR, fileHash)) // 查看切片目录是否存在
      ? await fse.readdir(path.resolve(UPLOAD_CHUNK_DIR, fileHash)) // 返回已上传的切片地址
      : [];
  // 提取后缀名

  _pipeStream = (path, writeStream) =>
    new Promise((resolve) => {
      const readStream = fse.createReadStream(path);
      readStream.on("end", () => {
        fse.unlinkSync(path);
        resolve();
      });
      readStream.pipe(writeStream);
    });
  _mergeFileChunk = async (filePath, fileHash, chunkSize) => {
    const chunkDir = path.resolve(UPLOAD_CHUNK_DIR, fileHash);
    const chunkPaths = await fse.readdir(chunkDir);
    // 根据切片下标进行排序
    // 否则直接读取目录的获得的顺序可能会错乱
    chunkPaths.sort((a, b) => a.split("-")[1] - b.split("-")[1]);
    await Promise.all(
      chunkPaths.map((chunkPath, index) =>
        this._pipeStream(
          path.resolve(chunkDir, chunkPath),
          // 指定位置创建可写流
          fse.createWriteStream(filePath, {
            start: index * chunkSize,
            end: (index + 1) * chunkSize,
          })
        )
      )
    );
    fse.rmdirSync(chunkDir); // 合并后删除保存切片的目录
  };
  verify = (file) => {
    return new Promise(async (resolve, reject) => {
      const {
        fileId,
        fileHash,
        chunkSize,
        fileSize,
        parentId,
        userId,
        fileName,
      } = file;
      let result = {};
      try {
        // 重传恢复
        if (fileId !== "") {
          const { doc } = await this.fileDao.findFileByFileId(
            fileId,
            "is_uploaded"
          ); // 判断文件是否已经有一份上传成功并在服务器了
          if (doc.isUploaded) {
            // 文件已经在服务器上传完成
            result = {
              data: { shouldUpload: false },
              msg: "文件上传完成",
            };
            this.merge({
              fileId,
              fileHash,
              chunkSize,
              parentId,
              userId,
              fileName,
            });
          } else {
            result = {
              data: {
                shouldUpload: true,
                // 文件未上传，但有可能已上传了部分切片，所以返回的是已上传的所有切片地址
                uploadedList: await this._createUploadedList(fileHash),
              },
              msg: "文件已添加，尚未上传完成",
            };
          }
        } else {
          const fileId = nanoid();
          const curTime = new Date();
          const newFile = {
            ...file,
            fileId,
            uploadAt: curTime.getTime(),
            updateAt: curTime.getTime(),
          };
          await this.fileDao.addNewFile(newFile);
          const filePath = path.resolve(UPLOAD_FILE_DIR, fileHash);

          // 空文件或文件存在直接返回
          if (
            fileSize === 0 ||
            (fse.existsSync(filePath) && fse.statSync(filePath).isFile())
          ) {
            result = {
              data: { shouldUpload: false },
              msg: "文件上传完成",
            };
            this.merge({
              fileId,
              fileHash,
              chunkSize,
              parentId,
              userId,
              fileName,
            });
          } else {
            result = {
              data: {
                shouldUpload: true,
                uploadedList: await this._createUploadedList(fileHash),
                fileId,
              },
              msg: "文件已添加，尚未上传完成",
            };
          }
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  };
  upload = (req) => {
    // todo 并发同时上传同样的文件怎么办？
    const multipart = new multiparty.Form();

    multipart.on("error", function (err) {
      console.log("Emultipart 解析失败: " + err.stack);
    });
    return new Promise((resolve, reject) => {
      // multipart Api https://www.npmjs.com/package/multiparty
      try {
        multipart.parse(req, async (err, fields, files) => {
          if (err) {
            return reject(err);
          }
          const [chunk] = files.chunk; // 切面文件
          const [hash] = fields.hash; // 切片文件 hash 值
          const [fileHash] = fields.fileHash; // 文件 hash 值
          const filePath = path.resolve(UPLOAD_FILE_DIR, fileHash);
          const chunkDir = path.resolve(UPLOAD_CHUNK_DIR, fileHash);

          // 文件存在直接返回
          if (fse.existsSync(filePath) && fse.statSync(filePath).isFile()) {
            return resolve({
              data: null,
              msg: `切片上传成功`,
            });
          }

          // 切片目录不存在，创建切片目录
          if (!fse.existsSync(chunkDir)) {
            await fse.mkdirs(chunkDir);
          }
          // fs-extra 专用方法，类似 fs.rename 并且跨平台
          // fs-extra 的 rename 方法 windows 平台会有权限问题
          // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
          /**
           * 这里的 chunk.path 是 koa-bodyparser 库对上传的文件的系统临时存放的地址
           * 存放目录为 '/var/folders/g5/x7gcn7492qb3d6gbw1z6qjw00000gn/T'
           * 这个目录是 koa-bodyparser 通过使用 node 的 Api os.tmpdir() 进行获取的
           * 对于这个系统临时存放地址也可以进行更改，通过 koa-bodyparser 配置时的参数
           * */
          await fse.move(chunk.path, path.resolve(chunkDir, hash));
          return resolve({
            data: null,
            msg: `切片上传成功`,
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  };
  merge = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { fileHash, chunkSize, fileId, parentId, userId, fileName } =
          file;
        const filePath = path.resolve(UPLOAD_FILE_DIR, `${fileHash}`); // 获取组装文件输出地址
        // 不存在【hash】文件，有【hash】文件目录就合并
        if (!(fse.existsSync(filePath) && fse.statSync(filePath).isFile())) {
          await this._mergeFileChunk(filePath, fileHash, chunkSize);
        }
        await this.fileDao.updateFileUploaded({ fileId });
        await this.fileDao.addUserFile({ fileId, fileName, parentId, userId });

        await this.thumbnailService.createThumbnail(fileHash, 25);
        await this.fileDao.updateFileThumbnail({ fileId });

        resolve({
          data: null,
          message: "文件上传成功",
        });
      } catch (err) {
        reject(err);
      }
    });
  };
  list = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(file);
        const { parentId, userId } = file;
        const files = await this.fileDao.getFileList({ parentId, userId });

        resolve({
          data: files,
          message: "获取文件列表成功",
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

export default FileService;
