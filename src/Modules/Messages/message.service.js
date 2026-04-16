import UserModel from "../../DB/Models/user.model.js";
import MessageModel from "../../DB/Models/message.model.js";
import { create, find, findById } from "../../DB/database.repository.js";
import { NotFoundException } from "../../Utils/responnse/error.response.js";
import { successResponse } from "../../Utils/responnse/success.response.js";

export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;
  const user = await findById({
    model: UserModel,
    id: receiverId,
  });
  if (!user) {
    throw NotFoundException({ message: "User not found" });
  }

  const message = await MessageModel.create({
    receiverId: user._id,
    content,
    senderId: req.user._id,
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "Message sent successfully",
    data: { message },
  });
};

export const getMessage = async (req, res) => {
  const message = await find({
    model: MessageModel,
  });
  return successResponse({
    res,
    statusCode: 200,
    message: "Message Fetched successfully",
    data: { message },
  });
};
