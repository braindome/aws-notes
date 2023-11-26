const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const { sendResponse } = require("../../responses");
const { validateInput } = require("../../validation");
const bcrypt = require("bcryptjs");
const db = new AWS.DynamoDB.DocumentClient();

async function createAccount(
  username,
  hashedPassword,
  userId,
  firstName,
  lastName
) {
  try {
    await db
      .put({
        TableName: "accounts",
        Item: {
          username: username,
          password: hashedPassword,
          userId: userId,
          firstName: firstName,
          lastName: lastName,
        },
      })
      .promise();
    return { success: true, message: "Account created", userId: userId };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Could not create account",
      error: error,
    };
  }
}

async function signUp(username, password, firstName, lastName) {


  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = nanoid();

  const createAccountResult = await createAccount(
    username,
    hashedPassword,
    userId,
    firstName,
    lastName
  );
  return createAccountResult;
}

exports.handler = async (event, context) => {
  const { username, password, firstName, lastName } = JSON.parse(event.body);

  const validation = validateInput([username, password, firstName, lastName]);
  if (!validation.success) {
    return sendResponse(400, {
      success: false,
      message: "Input fields must be strings",
    });
  }

  const signUpResult = await signUp(username, password, firstName, lastName);

  return sendResponse(signUpResult.success ? 200 : 400, signUpResult);
};
