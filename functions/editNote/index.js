const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();
const middy = require("@middy/core");
const { validateToken } = require("../middleware/auth");

const editNote = async (event, context) => {
  if (event?.error && event.error === "401") {
    return sendResponse(401, { success: false, message: "Invalid token" });
  }

  const { noteId } = event.pathParameters;
  const updateAttributes = JSON.parse(event.body);

  updateAttributes.modifiedAt = new Date().toISOString();

  const updateExpression =
    "set " +
    Object.keys(updateAttributes)
      .map((attributeName) => `${attributeName} = :${attributeName}`)
      .join(", ");

  const expressionAttributeValues = Object.keys(updateAttributes).reduce(
    (values, attributeName) => {
      values[`:${attributeName}`] = updateAttributes[attributeName];
      return values;
    },
    {}
  );

  expressionAttributeValues[":noteId"] = noteId;

  try {
    await db
      .update({
        TableName: "note-db",
        Key: { id: noteId },
        ReturnValues: "ALL_NEW",
        UpdateExpression: updateExpression,
        ConditionExpression: "id = :noteId",
        ExpressionAttributeValues: expressionAttributeValues,
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
