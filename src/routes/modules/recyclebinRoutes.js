import { mapping } from "../../utils/core";
import RecyclebinController from "../../controller/RecyclebinController";
const recyclebinController = new RecyclebinController();
export default [
  {
    method: "POST",
    path: "/recyclebin/list",
    func: mapping(recyclebinController.recyclebinList),
  },
  {
    method: "POST",
    path: "/recyclebin/trash",
    func: mapping(recyclebinController.trash),
  },
  {
    method: "POST",
    path: "/recyclebin/restore",
    func: mapping(recyclebinController.restore),
  },
];
