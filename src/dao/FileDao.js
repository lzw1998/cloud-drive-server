import { File, UserFile } from "./models/file";
import { toHump, extractExt } from "../utils/core";

class FileDao {
  // 根据fileHash和fileSize查找文件信息
  findFileByFileId = (fileId, select = null, query = null) => {
    return new Promise((resolve, reject) => {
      File.findOne({ _id: fileId, ...query }, select, (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
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
          file_type: extractExt(fileName),
          content_type: contentType,
          chunk_size: chunkSize,
          file_size: fileSize,
          upload_at: uploadAt,
          update_at: updateAt,
          is_uploaded: false,
          is_thumbnailed: false,
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
  addUserFile = ({ fileId, parentId, userId, type }) => {
    return new Promise((resolve, reject) => {
      UserFile.create(
        {
          file_id: fileId,
          type: type,
          parent_id: parentId,
          user_id: userId,
          is_recycled: false,
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
  getFileList = ({ parentId, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.find({ parent_id: parentId, user_id: userId })
        .populate({ path: "file" })
        .exec((err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        });
    });
  };
  updateFileThumbnail = ({ fileId }) => {
    return new Promise((resolve, reject) => {
      File.updateOne({ _id: fileId }, { is_thumbnailed: true }, {}, (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };
}
export default FileDao;
