const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");
const { validateInput } = require("../../validation");


const deleteNote = async (event, context) => {
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

  console.log("Note ID: ", noteId);
  console.log("Event: ", event);

  if (!noteId) {
    return sendResponse(400, {
      success: false,
      message: "ID not available, can't delete note",
    });
  }


  const getParams = {
    TableName: "note-db",
    Key: {
      id: noteId,
    },
  };

  const updateParams = {
    TableName: "note-db",
    Key: {
      id: noteId,
    },
    UpdateExpression: "set isDeleted = :isDeleted",
    ExpressionAttributeValues: {
      ":isDeleted": true,
    },
  };

  try {
    const note = await db.get(getParams).promise();

    if (!note.Item) {
      return sendResponse(404, { success: false, message: "Note not found" });
    }

    if (note.Item.userId != event.id) {
      return sendResponse(404, {
        success: false,
        message: "Note does not belong to current user",
      });
    }

    // Uncomment to permanently delete
    //await db.delete({ TableName: "note-db", Key: { id: noteId } }).promise();

    // Soft delete
    await db.update(updateParams).promise();

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
