const { sendResponse } = require("../../responses");
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  return sendResponse(200, { success: true });
};
