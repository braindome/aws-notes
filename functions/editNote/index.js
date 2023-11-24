const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");

const editNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const updateAttributes = JSON.parse(event.body);
  const noteId = updateAttributes.id;
  const title = updateAttributes.title;
  const text = updateAttributes.text;

  if (!noteId || !title || !text) {
    return sendResponse(400, { success: false, message: "Missing input data" });
  }

  updateAttributes.modifiedAt = new Date().toISOString();

  const updateExpression =
    "set " +
    Object.keys(updateAttributes)
      .filter((attributeName) => attributeName !== "id")
      .map((attributeName) => `#${attributeName} = :${attributeName}`)
      .join(", ");

  const expressionAttributeValues = Object.keys(updateAttributes).reduce(
    (values, attributeName) => {
      if (attributeName !== "id") {
        values[`:${attributeName}`] = updateAttributes[attributeName];
      }
      return values;
    },
    {}
  );

  const expressionAttributeNames = Object.keys(updateAttributes).reduce(
    (names, attributeName) => {
      if (attributeName !== "id") {
        names[`#${attributeName}`] = attributeName;
        //names[attributeName] = `#${attributeName}`;
      }
      return names;
    },
    {}
  );

  const params = {
    TableName: "note-db",
    Key: {
      id: noteId,
    },
  };

  expressionAttributeValues[":noteId"] = noteId;

  try {
    const note = await db.get(params).promise();
    const conditionExpression = "id = :noteId";


    if (!note.Item) {
      return sendResponse(404, { success: false, message: "Note not found" });
    }

    if (note.Item.userId != event.id) {
      return sendResponse(404, {
        success: false,
        message: "Note does not belong to current user",
      });
    }

    await db
      .update({
        TableName: "note-db",
        Key: { id: noteId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ConditionExpression: "id = :noteId",
        ExpressionAttributeValues: {
          ...expressionAttributeValues,
          ":noteId": noteId,
        },
      })
      .promise();

    return sendResponse(200, { success: true });
  } catch (error) {
    return sendResponse(500, {
      success: false,
      message: "could not update note",
      error: error,
    });
  }
};

const handler = middy(editNote).use(validateToken);
module.exports = { handler };
