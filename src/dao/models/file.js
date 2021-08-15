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
});
const userFileSchema = new BaseSchema({
  type: String,
  parent_id: String,
  file_id: String,
  user_id: String,
  is_recycled: Boolean,
});
userFileSchema.virtual("file", {
  ref: "File",
  localField: "file_id",
  foreignField: "_id",
  justOne: true,
});

export const File = mongoClient.model("File", fileSchema, "file");
export const UserFile = mongoClient.model(
  "UserFile",
  userFileSchema,
  "user_file"
);
