import FileService from "../service/FileService";
import { handlePromise } from "../utils/core";

class FileController {
  fileService = new FileService();
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
        message: res.msg,
        // todo 删掉success字段
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
        message: res.msg,
        // todo 删掉success字段
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
        message: res.msg,
        // todo 删掉success字段
        success: true,
      };
    }
  };
}

export default FileController;
