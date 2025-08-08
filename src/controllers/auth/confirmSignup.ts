import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { getSecretHash } from "../../utils/auth";
import { cognitoClient } from "../../lib/cognitoClient";
import { APIGatewayProxyHandler } from "aws-lambda";

export const confirmSignup: APIGatewayProxyHandler = async (event: any) => {
  const { preferred_username, confirmationCode } = JSON.parse(event.body);

  try {
    if (!preferred_username || !confirmationCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Username and confirmation code are required",
        }),
      };
    }

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_APP_CLIENT_ID ?? "",
      Username: preferred_username,
      ConfirmationCode: confirmationCode,
      SecretHash: getSecretHash(preferred_username),
    });

    await cognitoClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User account confirmed successfully" }),
    };
  } catch (error: any) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  }
};
