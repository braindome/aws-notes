const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

const postNote = async (event, context) => {

  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const body = JSON.parse(event.body);
  
  const allowedProperties = ["title", "text"];
  const additionalProperties = Object.keys(body).filter(
    (prop) => !allowedProperties.includes(prop)
  );

  if (additionalProperties.length > 0) {
    return sendResponse(400, {
      success: false,
      message: "Only 'title' and 'text' are allowed as input properties",
    });
  }

  if (!body.title || !body.text) {
    return sendResponse(400, {
      success: false,
      message: "You need to input both a title and a text",
    });
  }

  if (body.title.length === 0 || body.text.lenth === 0) {
    return sendResponse(400, {
      success: false,
      message: "Not allowed to input empty fields",
    });
  }

  if (body.title.length > 50) {
    return sendResponse(400, {
      success: false,
      message: "Title cannot be longer than 50 chars",
    });
  }

  if (body.text.length > 400) {
    return sendResponse(400, {
      success: false,
      message: "Text cannot be longer than 400 chars",
    });
  }

  const createdAt = new Date();
  const modifiedAt = createdAt;

  body.id = uuidv4();
  body.createdAt = createdAt.toISOString();
  body.modifiedAt = modifiedAt.toISOString();
  body.isDeleted = false;

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
      message: "Could not post note. Check the provided data and try again",
    });
  }
};

const handler = middy(postNote).use(validateToken);

module.exports = { handler };
