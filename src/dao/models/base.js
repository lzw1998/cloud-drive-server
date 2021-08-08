import { Schema } from "mongoose";
import { toHump } from "../../utils/core";

class BaseSchema extends Schema {
  constructor(definition, options) {
    const defaultOptions = {
      versionKey: false,
      toJSON: {
        virtuals: true,
        transform: function (doc, ret, options) {
          delete ret._id;
          return toHump(ret);
        },
      },
      toObject: {
        virtuals: true,
        transform: function (doc, ret, options) {
          delete ret._id;
          return toHump(ret);
        },
      },
    };
    super(definition, { ...defaultOptions, ...options });
  }
}

export default BaseSchema;
