const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");

const getNotes = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  try {
    const { Items } = await db
      .scan({
        TableName: "note-db",
      })
      .promise();

    return sendResponse(200, { success: true, notes: Items });
  } catch (error) {
    return sendResponse(400, {
      success: false,
      message: "Could not get notes",
    });
  }
};

const handler = middy(getNotes).use(validateToken);

module.exports = { handler };
