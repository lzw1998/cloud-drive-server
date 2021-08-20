import { mapping } from "../../utils/core";
import RecyclebinController from "../../controller/RecyclebinController";
const recyclebinController = new RecyclebinController();
export default [
  {
    method: "POST",
    path: "/recyclebin/list",
    func: mapping(recyclebinController.recyclebinList),
  },
];
