import { mongo } from "mongoose";
import { File, UserFile, DownloadTask } from "./models/file";
import { extractExt, escapeRegex } from "../utils/core";

class FileDao {
  // 根据fileHash和fileSize查找文件信息
  findFileByFileId = ({ fileId, select = null, query = null }) => {
    return new Promise((resolve, reject) => {
      File.findOne({ _id: fileId, ...query }, select, (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };

  findFileByFileHash = ({ fileHash }) => {
    return new Promise((resolve, reject) => {
      File.findOne({ file_hash: fileHash }, "_id file_name", (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };

  // 根据fileHash和fileSize查找文件信息
  findFilesByFileIds = ({ fileIds, select = null, query = null }) => {
    return new Promise((resolve, reject) => {
      UserFile.find({ _id: { $in: fileIds }, ...query }, { ...select, file_id: true })
        .populate({ path: "file", select: "_id file_hash" })
        .exec((err, doc) => {
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
          has_thumbnail: false,
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
  addUserFile = ({ fileId = null, parentId = "", userId, type, fileName, createdAt, updateAt }) => {
    return new Promise((resolve, reject) => {
      UserFile.create(
        {
          file_id: fileId,
          type: type,
          parent_id: parentId === "" ? null : new mongo.ObjectId(parentId),
          user_id: userId,
          is_recycled: false,
          name: fileName,
          create_at: createdAt,
          update_at: updateAt,
        },
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc.toObject());
        }
      );
    });
  };
  getFileList = ({ parentId, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.find({
        parent_id: parentId === "" ? null : new mongo.ObjectId(parentId),
        user_id: userId,
        is_recycled: false,
      })
        .populate({ path: "file", select: "-file_name" })
        .sort("-update_at")
        .exec((err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        });
    });
  };
  getRecyclebinList = ({ userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.find({ user_id: userId, is_recycled: true })
        .populate({ path: "file", select: "-file_name" })
        .sort("-update_at")
        .exec((err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        });
    });
  };
  updateFileThumbnail = ({ fileId }, update) => {
    return new Promise((resolve, reject) => {
      File.updateOne({ _id: fileId }, { ...update }, {}, (err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };
  updateFileRecycle = ({ id, userId }, { updateAt, isRecycled, name, parentId }) => {
    // TODO 还没支持多选
    let condition = {
      $set: {},
    };
    if (updateAt !== undefined) {
      condition.$set.update_at = updateAt;
    }
    if (isRecycled !== undefined) {
      condition.$set.is_recycled = isRecycled;
    }
    if (name !== undefined) {
      condition.$set.name = name;
    }
    if (parentId !== undefined) {
      condition.$set.parent_id = parentId === "" ? null : new mongo.ObjectId(parentId);
    }
    console.log(condition);
    return new Promise((resolve, reject) => {
      // TODO npm为什么null不能更新？
      UserFile.updateOne(
        { _id: id, user_id: userId },
        {
          ...condition,
        },
        {},
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  };

  getFileById = ({ id, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.findOne({ _id: id, user_id: userId })
        .select("name file_id type parent_id")
        .populate({ path: "file", select: "_id file_hash content_type" })
        .exec((err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        });
    });
  };
  search = ({ name, type, userId, limit }) => {
    return new Promise((resolve, reject) => {
      const str = escapeRegex(name);
      const reg = `(${str})`;
      if (type && type[0] !== "") {
        UserFile.find({ name: new RegExp(reg, "g"), user_id: userId, is_recycled: false })
          .populate({ path: "file", select: "-file_name" })
          .sort("-update_at")
          .where("type")
          .in(type)
          .limit(limit)
          .exec((err, doc) => {
            if (err) {
              reject(err);
            }
            resolve(doc);
          });
      } else {
        UserFile.find({ name: new RegExp(reg, "g"), user_id: userId, is_recycled: false })
          .populate({ path: "file", select: "-file_name" })
          .sort("-update_at")
          .limit(limit)
          .exec((err, doc) => {
            if (err) {
              reject(err);
            }
            resolve(doc);
          });
      }
    });
  };
  deleteUserFiles = ({ deleteIds, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.deleteMany(
        { _id: { $in: deleteIds.map((item) => new mongo.ObjectId(item)) }, user_id: userId },
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        }
      );
    });
  };
  createDownloadTask = ({ files = [] }) => {
    return new Promise((resolve, reject) => {
      DownloadTask.create(
        {
          files: files,
          create_at: new Date().getTime(),
        },
        (err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc.id);
        }
      );
    });
  };
  getDownloadTask = ({ taskId }) => {
    return new Promise((resolve, reject) => {
      DownloadTask.findOne({ _id: taskId }, "files", (err, doc) => {
        if (err) {
          reject(err);
        }
        if (!doc) reject("不存在当前下载");
        else resolve(doc.files);
      });
    });
  };
  getCurExistFile = ({ name, parentId, userId, type }) => {
    return new Promise((resolve, reject) => {
      UserFile.find({
        name,
        type,
        user_id: userId,
        parent_id: parentId === "" ? null : new mongo.ObjectId(parentId),
        is_recycled: false,
      }).exec((err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };
  getCurFiles = ({ name: fileName, parentId, userId, type }) => {
    return new Promise((resolve, reject) => {
      let index = fileName.lastIndexOf(".") === -1 ? fileName.length : fileName.lastIndexOf(".");
      let name = escapeRegex(fileName.slice(0, index));
      let ext = escapeRegex(fileName.slice(index, fileName.length));
      const reg = `${name}(\\\(\\\d\\\))*(${ext})*$`;
      UserFile.find({
        name: new RegExp(reg, "g"),
        type,
        user_id: userId,
        parent_id: parentId === "" ? null : new mongo.ObjectId(parentId),
        is_recycled: false,
      }).exec((err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };
  getFolderFiles = ({ folderIds, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.aggregate()
        .graphLookup({
          from: "user_file",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent_id",
          as: "children",
          depthField: "depth",
          restrictSearchWithMatch: { is_recycled: false },
        })
        .match({
          _id: {
            $in: folderIds.map((item) => new mongo.ObjectId(item)),
          },
          user_id: userId,
        })
        .addFields({
          children: {
            $map: {
              input: "$children",
              as: "t",
              in: {
                id: { $toString: "$$t._id" },
                name: "$$t.name",
                parentId: { $toString: "$$t.parent_id" },
                depth: "$$t.depth",
                fileId: {
                  $ifNull: ["$$t.file_id", "$$REMOVE"],
                },
                type: "$$t.type",
              },
            },
          },
        })
        .unwind("children")
        .replaceRoot("children")
        .lookup({
          from: "file",
          localField: "fileId",
          foreignField: "_id",
          as: "file",
        })
        .unwind({
          path: "$file",
          preserveNullAndEmptyArrays: true,
        })
        .addFields({
          fileHash: {
            $cond: [
              {
                $ne: ["$file", []],
              },
              "$file.file_hash",
              "$$REMOVE",
            ],
          },
        })
        .project({
          id: 1,
          fileHash: 1,
          depth: 1,
          type: 1,
          name: 1,
          parentId: 1,
        })
        .exec((err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        });
    });
  };
  getFolders = ({ folderIds, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.find({
        _id: {
          $in: folderIds.map((item) => new mongo.ObjectId(item)),
        },
        user_id: userId,
        is_recycled: false,
      })
        .select("name id")
        .exec((err, doc) => {
          if (err) {
            reject(err);
          }
          resolve(doc);
        });
    });
  };
  getFolderPath = ({ folderId, userId }) => {
    return new Promise((resolve, reject) => {
      UserFile.aggregate([
        {
          $graphLookup: {
            from: "user_file",
            startWith: "$parent_id",
            connectFromField: "parent_id",
            connectToField: "_id",
            as: "folder_path",
            depthField: "depth",
            restrictSearchWithMatch: { is_recycled: false },
          },
        },
        {
          $match: {
            _id: new mongo.ObjectId(folderId),
            user_id: userId,
          },
        },
        {
          $addFields: {
            folder_path: {
              $map: {
                input: "$folder_path",
                as: "t",
                in: {
                  folder_id: {
                    $toString: "$$t._id",
                  },
                  folder_name: "$$t.name",
                  depth: "$$t.depth",
                  parent_id: {
                    $toString: "$$t.parent_id",
                  },
                },
              },
            },
          },
        },
      ]).exec((err, doc) => {
        if (err) {
          reject(err);
        }
        resolve(doc);
      });
    });
  };
}
export default FileDao;
