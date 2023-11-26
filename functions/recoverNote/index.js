const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { validateInput } = require("../../validation");

const recoverNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const { id } = JSON.parse(event.body);

  const validation = validateInput([id]);
  if (!validation.success) {
    return sendResponse(400, {
      success: false,
      message: "Input fields must be strings",
    });
  }

  const noteId = id;

  if (!noteId) {
    return sendResponse(400, { success: false, message: "Missing input data" });
  }

  const params = {
    TableName: "note-db",
    Key: {
      id: noteId,
    },
  };

  try {
    const note = await db.get(params).promise();

    if (!note.Item) {
      return sendResponse(404, { success: false, message: "Note not found" });
    }

    if (note.Item.userId != event.id) {
      return sendResponse(404, {
        success: false,
        message: "Note does not belong to current user",
      });
    }

    if (note.Item.isDeleted === false) {
      return sendResponse(404, {
        success: false,
        message: "Note has not been deleted",
      });
    }

    await db
      .update({
        TableName: "note-db",
        Key: { id: noteId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: "SET #isDeleted = :isDeleted",
        ExpressionAttributeNames: {
          "#isDeleted": "isDeleted",
        },
        ExpressionAttributeValues: {
          ":isDeleted": false,
        },
      })
      .promise();

    return sendResponse(200, { success: true, message: "Note restored" });
  } catch (error) {
    return sendResponse(500, {
      succes: false,
      message: "Unable to restore note",
    });
  }
};

const handler = middy(recoverNote).use(validateToken);

module.exports = { handler };
