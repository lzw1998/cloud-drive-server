import fs from "fs-extra";
import koaRouter from "koa-router";

const router = koaRouter();

function addMapping(router, mapping) {
  mapping.forEach((item) => {
    let method = item.method === "DELETE" ? "del" : item.method.toLowerCase();
    router[method](item.path, item.func);
  });
}

function addControllers(router, dir) {
  let files = fs.readdirSync(__dirname + "/" + dir);
  let js_files = files.filter((f) => {
    return f.endsWith(".js");
  });

  for (let f of js_files) {
    let mapping;
    import(__dirname + "/" + dir + "/" + f).then((res) => {
      mapping = res["default"];
      addMapping(router, mapping);
    });
  }
}

export default function (dir) {
  let _dir = dir || "modules";
  addControllers(router, _dir);
  return router.routes();
}
