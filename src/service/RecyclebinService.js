import { mongo } from "mongoose";

import FileDao from "../dao/FileDao";
import ThumbnailService from "./ThumbnailService";
import { escapeRegex } from "../utils/core";
class RecyclebinService {
  fileDao = new FileDao();
  thumbnailService = new ThumbnailService();
  _rename = (files, fileName) => {
    let index = fileName.lastIndexOf(".") === -1 ? fileName.length : fileName.lastIndexOf(".");
    let name = fileName.slice(0, index);
    let ext = fileName.slice(index, fileName.length);
    const str = `${escapeRegex(name)}(\\\(\\\d\\\))*(${escapeRegex(ext)})*$`;
    let max = 1;
    for (let i = 0; i < files.length; i++) {
      const reg = new RegExp(str, "g");
      if (reg.test(files[i].name)) {
        let num = RegExp.$1;
        if (num !== "") max = Math.max(parseInt(num.slice(1, num.length - 1)) + 1, max);
      }
    }
    return `${name}(${max})${ext}`;
  };
  recyclebinList = (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { parentId, userId } = params;
        const thumbnailTypes = ["image"];
        let doc = await this.fileDao.getRecyclebinList({ parentId, userId });
        const files = doc
          .map((item) => {
            if (item.type === "folder") return item;
            let {
              file: { id, ...fileInfo },
              ...userFile
            } = item.toObject();
            const result = {
              ...fileInfo,
              ...userFile,
            };
            if (thumbnailTypes.indexOf(userFile.type) === -1) return result;
            if (fileInfo.isThumbnailed && fileInfo.hasThumbnail)
              return {
                ...result,
                thumbnail: `${global.OSS_HOST}/thumbnail?fileHash=${fileInfo.fileHash}&contentType=${fileInfo.contentType}`,
                url: `${global.OSS_HOST}/image?fileHash=${fileInfo.fileHash}&contentType=${fileInfo.contentType}`,
              };
            else if (fileInfo.isThumbnailed && !fileInfo.hasThumbnail)
              return {
                ...result,
                thumbnail: `${global.OSS_HOST}/image?fileHash=${fileInfo.fileHash}&contentType=${fileInfo.contentType}`,
                url: `${global.OSS_HOST}/image?fileHash=${fileInfo.fileHash}&contentType=${fileInfo.contentType}`,
              };
            else return result;
          })
          .sort((a, b) => {
            if (a.type === "folder" && b.type !== "folder") return -1;
            else if (a.type !== "folder" && b.type === "folder") return 1;
            else return 0;
          });
        //获取文件列表成功
        resolve({
          data: files,
        });
      } catch (err) {
        reject(err);
      }
    });
  };
  trash = (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, userId } = params;
        const curTime = new Date();
        await this.fileDao.updateFileRecycle(
          {
            id,
            userId,
          },
          {
            updateAt: curTime.getTime(),
            isRecycled: true,
          }
        );
        // 移至回收站成功
        resolve({
          data: null,
        });
      } catch (err) {
        reject(err);
      }
    });
  };
  restore = (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { id, userId } = params;
        const curTime = new Date();
        const doc = await this.fileDao.getFileById({
          id,
          userId,
        });
        const docObj = doc.toObject();
        let { name: fileName, parentId, type } = docObj;
        // 查看恢复的文件所在目录（parentId）路径是否存在，若不存在,放到顶层
        if (parentId !== null) {
          const doc = await this.fileDao.getFolderPath({ folderId: parentId, userId });
          if (!doc) reject("不存在当前路径");
          else {
            // 父目录的父目录是顶层，并且父目录被删除，移到顶层
            if (doc.length === 0) parentId = "";
            else if (doc[0].parent_id === null) {
              if (doc[0].is_recycled === true) parentId = "";
            }
            // 父目录不是顶层，并且父目录的路径不可寻址（路径上有被移删除的），移到顶层
            else if (doc[0].folder_path.length === 0) parentId = "";
            else if (doc[0].folder_path[0].parent_id !== null) parentId = "";
          }
        } else {
          parentId = "";
        }

        // 在恢复的文件路径下，判断是否重名
        const file = await this.fileDao.getCurExistFile({
          name: fileName,
          parentId: parentId,
          userId,
          type: type,
        });
        if (file.length !== 0) {
          const files = await this.fileDao.getCurFiles({ name: fileName, parentId, userId, type });
          fileName = this._rename(files, fileName);
        }
        await this.fileDao.updateFileRecycle(
          {
            id,
            userId,
          },
          {
            updateAt: curTime.getTime(),
            isRecycled: false,
            name: fileName,
            parentId: parentId,
          }
        );

        // 从回收站恢复成功
        resolve({
          data: null,
        });
      } catch (err) {
        reject(err);
      }
    });
  };
}

export default RecyclebinService;
