import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: [2, "Message must be at least 2 characters"],
      maxlength: [1000, "Message must be at most 1000 characters"],
      trim: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
