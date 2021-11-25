import FileService from "../service/FileService";
import ThumbnailService from "../service/ThumbnailService";
import { handlePromise } from "../utils/core";
class FileController {
  fileService = new FileService();
  thumbnailService = new ThumbnailService();
  verify = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.verify(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `文件添加失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  upload = async (ctx) => {
    const req = ctx.req;
    const [res, err] = await handlePromise(this.fileService.upload(req));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `切片上传失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  merge = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.merge(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `文件上传失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  fileList = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.fileList(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `获取文件列表失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  thumbnail = async (ctx) => {
    const req = ctx.request;
    const [thumbnail, err] = await handlePromise(this.thumbnailService.thumbnail(req.query));
    if (err) {
      return {
        data: {
          code: 500,
          data: null,
          message: `获取缩略图失败【${err}】`,
          success: false,
        },
        contentType: "application/json",
      };
    } else {
      return {
        data: thumbnail.file,
        contentType: thumbnail.contentType,
      };
    }
  };
  image = async (ctx) => {
    const req = ctx.request;
    // TODO .txt 改成.png上传出问题houzhuibianli
    const [image, err] = await handlePromise(this.fileService.image(req.query));
    if (err) {
      return {
        data: {
          code: 500,
          data: null,
          message: `获取图片失败【${err}】`,
          success: false,
        },
        contentType: "application/json",
      };
    } else {
      return {
        data: image.file,
        contentType: image.contentType,
      };
    }
  };
  // TODO download thumbnail image 这些请求都应该和用户id有关，
  download = async (ctx) => {
    const req = ctx.request;
    const [doc, err] = await handlePromise(this.fileService.download(req.query));
    if (err) {
      return {
        data: {
          code: 500,
          data: null,
          message: `文件下载失败【${err}】`,
          success: false,
        },
      };
    } else {
      // const path = `upload/${doc.name}`;
      return {
        code: 200,
        data: doc.data,
        success: true,
      };
    }
  };
  getDownloadUrl = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.getDownloadUrl(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `获取文件下载链接失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  multiDownloadUrl = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.multiDownloadUrl(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `获取多文件下载链接失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  createFoloder = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.createFoloder(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `文件夹创建失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  getFolderPath = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.getFolderPath(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `获取文件路径失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  search = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.search(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `文件搜索失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
  delete = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.fileService.delete(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `文件删除失败【${err}】`,
        success: false,
      };
    } else {
      return {
        code: 200,
        data: res.data,
        success: true,
      };
    }
  };
}

export default FileController;
