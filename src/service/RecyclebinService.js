import FileDao from "../dao/FileDao";
import ThumbnailService from "./ThumbnailService";

class RecyclebinService {
  fileDao = new FileDao();
  thumbnailService = new ThumbnailService();
  recyclebinList = (file) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { parentId, userId } = file;
        console.log(parentId, userId);
        const thumbnailTypes = ["image"];
        let doc = await this.fileDao.getFileList({ parentId, userId });
        const files = doc.map((item) => {
          let rawfile = item.toObject();
          if (thumbnailTypes.indexOf(rawfile.type) === -1) return rawfile;
          if (rawfile.file.isThumbnailed && rawfile.file.hasThumbnail)
            return {
              ...rawfile,
              thumbnail: `${global.OSS_HOST}/thumbnail?fileHash=${rawfile.file.fileHash}&contentType=${rawfile.file.contentType}`,
            };
          else if (rawfile.file.isThumbnailed && !rawfile.file.hasThumbnail)
            return {
              ...rawfile,
              thumbnail: `${global.OSS_HOST}/image?fileHash=${rawfile.file.fileHash}&contentType=${rawfile.file.contentType}`,
            };
          else return rawfile;
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
}

export default RecyclebinService;
