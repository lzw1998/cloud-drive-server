// let mongoose = require("mongoose");
// const { nanoid } = require("nanoid");
import mongoose from "mongoose";
import mongodbConfig from "../../config/mongodb";
/**
 * 使用 Node 自带 Promise 代替 mongoose 的 Promise,否则会报错
 */
mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);
/**
 * 配置 MongoDb options
 */
function getMongodbConfig() {
  let options = {
    useNewUrlParser: true,
    poolSize: 5, // 连接池中维护的连接数
    keepAlive: 120,
    useUnifiedTopology: true,
  };
  return options;
}
/**
 * 拼接 MongoDb Uri
 *
 */
function getMongoUrl() {
  let mongoUrl = "mongodb://";
  let dbName = mongodbConfig.db;
  mongoUrl += `${mongodbConfig.host}:${mongodbConfig.port}`;
  mongoUrl += `/${dbName}`;

  return mongoUrl;
}
/**
 * 关闭MongoDb连接
 *
 */
function closeMongoClient() {
  mongoClient.close();
}

let mongoClient = mongoose.createConnection(getMongoUrl(), getMongodbConfig());
export { mongoClient, closeMongoClient };

// let fileSchema = mongoose.Schema(
//   {
//     _id: String,
//     file_name: String,
//     hash: String,
//     content_type: String,
//     chunk_size: Number,
//     file_size: Number,
//     upload_at: Date,
//     update_at: Date,
//     is_recycled: Boolean,
//   },
//   { versionKey: false }
// );

// let chunkSchema = mongoose.Schema(
//   {
//     _id: String,
//     file_id: String,
//     data: String,
//     n: Number,
//   },
//   { versionKey: false }
// );

// const File = mongoose.model("File", fileSchema);

// let newFile = new File({
//   _id: nanoid(),
//   name: "newFile",
//   uploadAt: new Date(),
//   updateAt: new Date(),
//   type: "folder",
//   size: "2038",
//   isRecycled: false,
// });
// const res = new Promise((resolve, reject) => {
//   newFile.save((err) => {
//     if (err) {
//       reject(err);
//     }
//     resolve();
//   });
// });
// console.log(res);
// export default models;
