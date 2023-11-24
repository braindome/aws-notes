const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");

const deleteNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const body = JSON.parse(event.body);
  const noteId = body.id;

  console.log("Note ID: ", noteId);
  console.log("Event: ", event);

  if (!noteId) {
    return sendResponse(400, {
      success: false,
      message: "ID not available, can't delete note",
    });
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

    await db.delete({ TableName: "note-db", Key: { id: noteId } }).promise();

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
