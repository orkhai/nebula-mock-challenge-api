"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/score/getLeaderboard.ts
var getLeaderboard_exports = {};
__export(getLeaderboard_exports, {
  getLeaderboard: () => getLeaderboard
});
module.exports = __toCommonJS(getLeaderboard_exports);

// src/lib/dynamoClient.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({
  region: process.env.AWS_REGION
});
var dynamoClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var dynamoClient_default = dynamoClient;

// src/controllers/score/getLeaderboard.ts
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");
var getLeaderboard = async (event) => {
  try {
    const data = await dynamoClient_default.send(
      new import_lib_dynamodb2.ScanCommand({
        TableName: process.env.LEADERBOARD_TABLE_NAME
      })
    );
    const items = data.Items || [];
    items.sort((a, b) => (b.score || 0) - (a.score || 0));
    const topScore = items.slice(0, 1);
    return { statusCode: 200, body: JSON.stringify({ topScore }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLeaderboard
});
//# sourceMappingURL=getLeaderboard.js.map
