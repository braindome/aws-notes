const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");

const deleteNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const { noteId } = event.pathParameters;

  try {
    await db
      .delete({
        TableName: "note-db",
        Key: { id: noteId },
      })
      .promise();

    return sendResponse(200, { success: true, message: "Note deleted" });
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "Unable to delete note",
    });
  }
};

const handler = middy(deleteNote).use(validateToken);

module.exports = { handler };
