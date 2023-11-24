const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const { notDependencies } = require("mathjs");

const postNote = async (event, context) => {
  const body = JSON.parse(event.body);

  body.id = uuidv4();

  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  if (Object.keys(body).length > 2) {
    return sendResponse(400, {
        success: false,
        message: 'Too many attributes'
    });
}

  const createdAt = new Date();
  const modifiedAt = createdAt;

  body.createdAt = createdAt.toISOString();
  body.modifiedAt = modifiedAt.toISOString();
  body.isDeleted = false;

  if (!body.title || !body.text) {
    return sendResponse(400, {success: false, message: "You need to input both a title and a text"})
  }

  if (body.title.length > 50) {
    return sendResponse(400, {success: false, message: "Title cannot be longer than 50 chars"})
  }

  if (body.title.text > 400) {
    return sendResponse(400, {success: false, message: "Text cannot be longer than 400 chars"})
  }

  try {
    await db
      .put({
        TableName: "note-db",
        Item: body,
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Could not post note",
    });
  }
};

const handler = middy(postNote).use(validateToken);

module.exports = { handler };
