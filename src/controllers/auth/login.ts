import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { getSecretHash } from "../../utils/auth";
import { cognitoClient } from "../../lib/cognitoClient";
import { APIGatewayProxyHandler } from "aws-lambda";

export const login: APIGatewayProxyHandler = async (event: any) => {
  const { preferred_username, password } = JSON.parse(event.body);

  try {
    if (!preferred_username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing username or password" }),
      };
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      AuthParameters: {
        USERNAME: preferred_username,
        PASSWORD: password,
        SECRET_HASH: getSecretHash(preferred_username)!,
      },
    });

    const response = await cognitoClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ token: response.AuthenticationResult }),
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
