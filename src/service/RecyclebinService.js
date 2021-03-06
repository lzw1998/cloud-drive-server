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
        //????????????????????????
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
        // ?????????????????????
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
        // ????????????????????????????????????parentId????????????????????????????????????,????????????
        if (parentId !== null) {
          const doc = await this.fileDao.getFolderPath({ folderId: parentId, userId });
          if (!doc) reject("?????????????????????");
          else {
            // ????????????????????????????????????????????????????????????????????????
            if (doc.length === 0) parentId = "";
            else if (doc[0].parent_id === null) {
              if (doc[0].is_recycled === true) parentId = "";
            }
            // ????????????????????????????????????????????????????????????????????????????????????????????????????????????
            else if (doc[0].folder_path.length === 0) parentId = "";
            else if (doc[0].folder_path[0].parent_id !== null) parentId = "";
          }
        } else {
          parentId = "";
        }

        // ????????????????????????????????????????????????
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

        // ????????????????????????
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
