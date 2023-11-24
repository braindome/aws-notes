const jwt = require("jsonwebtoken");

const validateToken = {
  before: async (request) => {
    try {
      if (!request.event.headers.authorization.includes("Bearer ")) {
        throw new Error("Invalid authorization header");
      }

      const token = request.event.headers.authorization.replace("Bearer ", "");

      if (!token) throw new Error();

      const data = jwt.verify(token, "aabbcc");

      request.event.id = data.id;
      request.event.username = data.username;

      if (request.event.body) {
        request.event.body = JSON.parse(request.event.body);
        request.event.body.userId = data.id;
        request.event.body = JSON.stringify(request.event.body);
      }

      return request.response;
    } catch (error) {
      console.error(error);
      request.event.error = "401";
      return request.response;
    }
  },
  onError: async (request) => {
    request.event.error = "401";
    return request.response;
  },
};

module.exports = { validateToken };
