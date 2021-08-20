import { mapping, staticMapping } from "../../utils/core";
import FileController from "../../controller/FileController";
const fileController = new FileController();
export default [
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
];
