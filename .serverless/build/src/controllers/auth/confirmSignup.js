"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/auth/confirmSignup.ts
var confirmSignup_exports = {};
__export(confirmSignup_exports, {
  confirmSignup: () => confirmSignup
});
module.exports = __toCommonJS(confirmSignup_exports);
var import_client_cognito_identity_provider2 = require("@aws-sdk/client-cognito-identity-provider");

// src/utils/auth.ts
var import_crypto = __toESM(require("crypto"));
function getSecretHash(username) {
  return import_crypto.default.createHmac("SHA256", process.env.COGNITO_APP_SECRET ?? "").update(username + (process.env.COGNITO_APP_CLIENT_ID ?? "")).digest("base64");
}

// src/lib/cognitoClient.ts
var import_client_cognito_identity_provider = require("@aws-sdk/client-cognito-identity-provider");
var cognitoClient = new import_client_cognito_identity_provider.CognitoIdentityProviderClient({
  region: process.env.AWS_REGION
});

// src/controllers/auth/confirmSignup.ts
var confirmSignup = async (event) => {
  const { preferred_username, confirmationCode } = JSON.parse(event.body);
  try {
    if (!preferred_username || !confirmationCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Username and confirmation code are required"
        })
      };
    }
    const command = new import_client_cognito_identity_provider2.ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_APP_CLIENT_ID ?? "",
      Username: preferred_username,
      ConfirmationCode: confirmationCode,
      SecretHash: getSecretHash(preferred_username)
    });
    await cognitoClient.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User account confirmed successfully" })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  confirmSignup
});
//# sourceMappingURL=confirmSignup.js.map
