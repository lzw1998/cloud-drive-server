import { Schema, mongo } from "mongoose";
import { formatHumpLineTransfer } from "../../utils/core";

class BaseSchema extends Schema {
  constructor(definition, options) {
    const defaultOptions = {
      versionKey: false,
      toJSON: {
        virtuals: true,
        transform: function (doc, ret, options) {
          delete ret._id;
          for (let key in ret) {
            // console.log(key, ret[key], ret[key] instanceof mongo.ObjectId);
            if (ret[key] instanceof mongo.ObjectId) ret[key] = ret[key].toString();
          }
          return formatHumpLineTransfer(ret, "hump");
        },
      },
      toObject: {
        virtuals: true,
        transform: function (doc, ret, options) {
          delete ret._id;
          for (let key in ret) {
            // console.log(key, ret[key], ret[key] instanceof mongo.ObjectId);
            if (ret[key] instanceof mongo.ObjectId) {
              ret[key] = ret[key].toString();
            }
          }
          return formatHumpLineTransfer(ret, "hump");
        },
      },
    };
    super(definition, { ...defaultOptions, ...options });
  }
}

export default BaseSchema;
