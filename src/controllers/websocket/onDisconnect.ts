import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import dynamoClient from "../../lib/dynamoClient";

export const onDisconnect: APIGatewayProxyHandler = async (event) => {
  try {
    const connectionId = event.requestContext?.connectionId;
    if (!connectionId) return { statusCode: 400, body: "No connectionId" };

    await dynamoClient.send(
      new DeleteCommand({
        TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME,
        Key: { connectionId },
      })
    );

    return { statusCode: 200, body: "disconnected" };
  } catch (error) {
    return { statusCode: 500, body: "Disconnection failed" };
  }
};
