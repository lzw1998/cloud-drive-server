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
}

export default RecyclebinController;
