import { File } from "./models/file";
import { toHump } from "../utils/core";

class FileDao {
  // 根据fileHash和fileSize查找文件信息
  findFileByFileId = (fileId) => {
    return new Promise((resolve, reject) => {
      File.findOne({ _id: fileId }, (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(toHump(doc));
      });
    });
  };
  // 添加新文件信息
  addNewFile = ({ fileId, fileHash, fileName, fileSize, contentType, chunkSize, uploadAt, updateAt }) => {
    return new Promise((resolve, reject) => {
      File.create(
        {
          _id: fileId,
          file_name: fileName,
          file_hash: fileHash,
          content_type: contentType,
          chunk_size: chunkSize,
          file_size: fileSize,
          upload_at: uploadAt,
          update_at: updateAt,
          is_uploaded: false,
        },
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  };
  // 根据fileHash和fileSize查找文件信息
  updateFileUploaded = ({ fileId }) => {
    return new Promise((resolve, reject) => {
      File.updateOne({ _id: fileId }, { is_uploaded: true }, {}, (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };
}
export default FileDao;
