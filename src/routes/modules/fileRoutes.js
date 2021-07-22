import { mapping } from "../../utils/core";
import FileController from "../../controller/FileController";

const fileController = new FileController();
// const verify = async (ctx, next) => {
//   const data = await handleVerifyUpload(ctx);
//   ctx.body = data;
// };

// const upload = async (ctx, next) => {
//   const data = await handleFormData(ctx);
//   ctx.response.status = data.code;
//   ctx.body = data;
// };

// const merge = async (ctx, next) => {
//   const data = await handleMerge(ctx);
//   ctx.body = data;
// };

// const mapping = (func) => {
//   return (ctx, next) => {
//     const data = func(ctx);
//     ctx.response.status = data.code;
//     ctx.body = data;
//   };
// };

export default [
  {
    method: "POST",
    path: "/verify",
    func: mapping(fileController.verify),
  },
  {
    method: "POST",
    path: "/upload",
    func: mapping(fileController.upload),
  },
  {
    method: "POST",
    path: "/merge",
    func: mapping(fileController.merge),
  },
];
