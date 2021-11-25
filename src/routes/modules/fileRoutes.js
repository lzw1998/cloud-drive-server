import { mapping, staticMapping, downloadMapping } from "../../utils/core";
import FileController from "../../controller/FileController";
const fileController = new FileController();
export default [
  {
    method: "GET",
    path: "/download",
    func: downloadMapping(fileController.download),
  },

  {
    method: "GET",
    path: "/thumbnail",
    func: staticMapping(fileController.thumbnail),
  },
  {
    method: "GET",
    path: "/image",
    func: staticMapping(fileController.image),
  },
  {
    method: "POST",
    path: "/getDownloadUrl",
    func: mapping(fileController.getDownloadUrl),
  },
  {
    method: "POST",
    path: "/multiDownloadUrl",
    func: mapping(fileController.multiDownloadUrl),
  },
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
  {
    method: "POST",
    path: "/file/list",
    func: mapping(fileController.fileList),
  },
  {
    method: "POST",
    path: "/file/createFoloder",
    func: mapping(fileController.createFoloder),
  },
  {
    method: "POST",
    path: "/file/getFolderPath",
    func: mapping(fileController.getFolderPath),
  },
  {
    method: "POST",
    path: "/file/search",
    func: mapping(fileController.search),
  },
  {
    method: "POST",
    path: "/file/delete",
    func: mapping(fileController.delete),
  },
];
