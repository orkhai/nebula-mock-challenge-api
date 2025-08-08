import { APIGatewayProxyHandler } from "aws-lambda";
import { decodeJwt } from "../../utils/decodeJwt";
import dynamoClient from "../../lib/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const onConnect: APIGatewayProxyHandler = async (event) => {
  try {
    const token = event.queryStringParameters?.token;
    if (!token) return { statusCode: 401, body: "Missing token" };

    const user = decodeJwt(token);
    const userId = user.sub;

    await dynamoClient.send(
      new PutCommand({
        TableName: "websocket_connections",
        Item: {
          user_id: userId,
          connectionId: event.requestContext.connectionId,
        },
      })
    );

    return { statusCode: 200, body: "Connected" };
  } catch (e) {
    return { statusCode: 500, body: "Connection failed" };
  }
};
