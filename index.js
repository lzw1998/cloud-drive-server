import Koa from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import cors from "koa2-cors";
import routes from "./src/routes";
import corsConfig from "./config/cors";
import globals from "./config/global";
import staticResource from "koa-static";
import { mongoClient } from "./src/dao";

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV !== "developement";
console.log(`isProduction: ${isProduction}`);
const app = new Koa();

// 添加全局变量
for (let key in globals) {
  global[key] = globals[key];
}

// 日志
!isProduction ? app.use(logger()) : "";

// CORS 跨域配置
app.use(cors(corsConfig));

// koa-bodyparser
app.use(bodyParser());
// add router middleware:
app.use(routes());
// add static
app.use(staticResource(__dirname + "/static"));

/**
 * 监听Mongo连接
 */
mongoClient.on("connected", function () {
  console.log("Mongoose连接成功" + new Date());
});
mongoClient.on("error", function (err) {
  console.log("Mongoose 连接失败，原因: " + err);
});
mongoClient.on("disconnected", function () {
  console.log("Mongoose 连接关闭");
});

app.listen(PORT, () => {
  console.log(`server started at localhost:${PORT} ${new Date()}`);
});
