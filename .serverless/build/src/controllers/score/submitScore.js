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

// src/controllers/score/submitScore.ts
var submitScore_exports = {};
__export(submitScore_exports, {
  submitScore: () => submitScore
});
module.exports = __toCommonJS(submitScore_exports);

// node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/esm/rng.js
var import_crypto = require("crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// node_modules/uuid/dist/esm/native.js
var import_crypto2 = require("crypto");
var native_default = { randomUUID: import_crypto2.randomUUID };

// node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/controllers/score/submitScore.ts
var import_lib_dynamodb2 = require("@aws-sdk/lib-dynamodb");

// src/lib/dynamoClient.ts
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var client = new import_client_dynamodb.DynamoDBClient({
  region: process.env.AWS_REGION
});
var dynamoClient = import_lib_dynamodb.DynamoDBDocumentClient.from(client);
var dynamoClient_default = dynamoClient;

// src/controllers/score/submitScore.ts
var import_client_apigatewaymanagementapi2 = require("@aws-sdk/client-apigatewaymanagementapi");
var import_client_cognito_identity_provider2 = require("@aws-sdk/client-cognito-identity-provider");

// src/lib/cognitoClient.ts
var import_client_cognito_identity_provider = require("@aws-sdk/client-cognito-identity-provider");
var cognitoClient = new import_client_cognito_identity_provider.CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

// src/lib/websocketClient.ts
var import_client_apigatewaymanagementapi = require("@aws-sdk/client-apigatewaymanagementapi");
var websocketClient = new import_client_apigatewaymanagementapi.ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_CONNECTION_URL,
  region: process.env.AWS_REGION
});

// src/controllers/score/submitScore.ts
var submitScore = async (event) => {
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" })
      };
    const token = authHeader.split(" ")[1];
    const user = await cognitoClient.send(
      new import_client_cognito_identity_provider2.GetUserCommand({ AccessToken: token })
    );
    const attributes = (user.UserAttributes || []).reduce((acc, a) => {
      acc[a.Name] = a.Value;
      return acc;
    }, {});
    const user_id = attributes["sub"];
    const user_name = attributes["preferred_username"] || attributes["name"] || "unknown user name";
    const { score } = JSON.parse(event.body || {});
    if (typeof score !== "number") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Score must be a number" })
      };
    }
    const item = {
      id: v4_default(),
      user_id,
      user_name,
      score: Number(score),
      timestamp: Date.now()
    };
    await dynamoClient_default.send(
      new import_lib_dynamodb2.PutCommand({
        TableName: process.env.LEADERBOARD_TABLE_NAME ?? "",
        Item: item
      })
    );
    if (score > 1e3) {
      const connections = await dynamoClient_default.send(
        new import_lib_dynamodb2.ScanCommand({
          TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME,
          ProjectionExpression: "connectionId"
        })
      );
      const items = connections.Items || [];
      console.log("Connections count:", connections.Count);
      const messagePayload = JSON.stringify({
        event: "high_score",
        data: {
          user_id,
          user_name,
          score
        }
      });
      for (const item2 of items) {
        const connectionId = item2.connectionId;
        console.log("Sending to connectionId:", connectionId);
        try {
          await websocketClient.send(
            new import_client_apigatewaymanagementapi2.PostToConnectionCommand({
              ConnectionId: connectionId,
              Data: Buffer.from(messagePayload)
            })
          );
        } catch (error) {
          console.error("PostToConnection error", error);
          if (error.name === "GoneException" || error.$metadata?.httpStatusCode === 410) {
            console.log("Deleting stale connectionId:", connectionId);
            await dynamoClient_default.send(
              new import_lib_dynamodb2.DeleteCommand({
                TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME,
                Key: { connectionId }
              })
            );
          }
        }
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Score submitted.", item })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  submitScore
});
//# sourceMappingURL=submitScore.js.map
