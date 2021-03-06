import { Schema } from "mongoose";
import BaseSchema from "./base";
import { mongoClient } from "../index";
const fileSchema = new BaseSchema({
  _id: String,
  file_name: String,
  file_hash: String,
  file_type: String,
  content_type: String,
  chunk_size: Number,
  file_size: Number,
  upload_at: Number,
  update_at: Number,
  is_uploaded: Boolean,
  is_thumbnailed: Boolean,
  has_thumbnail: Boolean,
});
const userFileSchema = new BaseSchema({
  type: String,
  // TODO DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
  parent_id: {
    type: Schema.Types.ObjectId,
    index: true,
  },
  file_id: String,
  user_id: String,
  is_recycled: Boolean,
  create_at: Number,
  update_at: Number,
  name: String,
});

const downloadTaskSchema = new BaseSchema({
  files: [],
  create_at: Number,
});
userFileSchema.virtual("file", {
  ref: "File",
  localField: "file_id",
  foreignField: "_id",
  justOne: true,
});

export const File = mongoClient.model("File", fileSchema, "file");
export const UserFile = mongoClient.model("UserFile", userFileSchema, "user_file");
export const DownloadTask = mongoClient.model("DownloadTask", downloadTaskSchema, "download_task");
