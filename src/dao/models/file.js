import { Schema } from "mongoose";
import { mongoClient } from "../index";
const fileSchema = Schema(
  {
    _id: String,
    file_name: String,
    file_hash: String,
    content_type: String,
    chunk_size: Number,
    file_size: Number,
    upload_at: Number,
    update_at: Number,
    is_uploaded: Boolean,
  },
  { versionKey: false }
);
export const File = mongoClient.model("File", fileSchema, "file");
