const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require('uuid');

const postNote = async (event, context) => {

    const body = JSON.parse(event.body);

    body.id = uuidv4();

  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
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
    return sendResponse(500, { success: false, message: "Could not post note" });
  }
};

const handler = middy(postNote).use(validateToken);

module.exports = { handler };
