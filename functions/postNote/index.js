const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { validateInput } = require("../../validation");
const { v4: uuidv4 } = require("uuid");

const postNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const { title, text } = JSON.parse(event.body);

  const validation = validateInput([title, text]);
  if (!validation.success) {
    return sendResponse(400, {
      success: false,
      message: "Input fields must be strings",
    });
  }

  if (!title || !text) {
    return sendResponse(400, {
      success: false,
      message: "You need to input both a title and a text",
    });
  }

  if (title.length === 0 || text.lenth === 0) {
    return sendResponse(400, {
      success: false,
      message: "Not allowed to input empty fields",
    });
  }

  if (title.length > 50) {
    return sendResponse(400, {
      success: false,
      message: "Title cannot be longer than 50 chars",
    });
  }

  if (text.length > 400) {
    return sendResponse(400, {
      success: false,
      message: "Text cannot be longer than 400 chars",
    });
  }

  const createdAt = new Date();
  const modifiedAt = createdAt;

  const body = {
    id: uuidv4(),
    title: title,
    text: text,
    createdAt: createdAt.toISOString(),
    modifiedAt: modifiedAt.toISOString(),
    isDeleted: false,
    userId: event.id,
  };

  try {
    await db
      .put({
        TableName: "note-db",
        Item: body,
      })
      .promise();

    return sendResponse(200, {
      success: true,
      message: "Note posted successfully",
    });
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Could not post note. Check the provided data and try again",
    });
  }
};

const handler = middy(postNote).use(validateToken);

module.exports = { handler };
