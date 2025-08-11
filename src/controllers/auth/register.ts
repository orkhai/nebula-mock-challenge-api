import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { getSecretHash } from "../../utils/auth";
import { cognitoClient } from "../../lib/cognitoClient";
import { APIGatewayProxyHandler } from "aws-lambda";

export const register: APIGatewayProxyHandler = async (event: any) => {
  const { email, password, name, preferred_username } = JSON.parse(
    event.body || {}
  );

  try {
    if (!email || !password || !name || !preferred_username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_APP_CLIENT_ID,
      SecretHash: getSecretHash(preferred_username),
      Username: preferred_username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: name },
        { Name: "preferred_username", Value: preferred_username },
      ],
    });

    await cognitoClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Registration successful. Check your email to confirm.",
      }),
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
