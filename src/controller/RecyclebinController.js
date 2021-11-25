import RecyclebinService from "../service/RecyclebinService";
import ThumbnailService from "../service/ThumbnailService";
import { handlePromise } from "../utils/core";

class RecyclebinController {
  recyclebinService = new RecyclebinService();
  thumbnailService = new ThumbnailService();
  recyclebinList = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.recyclebinService.recyclebinList(data));
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
  trash = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.recyclebinService.trash(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `移至回收站失败【${err}】`,
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
  restore = async (ctx) => {
    const req = ctx.request;
    const data = req.body;
    const [res, err] = await handlePromise(this.recyclebinService.restore(data));
    if (err) {
      return {
        code: 500,
        data: null,
        message: `恢复失败【${err}】`,
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

export default RecyclebinController;
