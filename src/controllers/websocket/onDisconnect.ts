import { DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import dynamoClient from "../../lib/dynamoClient";

export const onDisconnect: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  const result = await dynamoClient.send(
    new ScanCommand({
      TableName: "websocket_connections",
      FilterExpression: "connectionId = :cid",
      ExpressionAttributeValues: {
        ":cid": connectionId,
      },
    })
  );

  const user = result.Items?.[0];
  if (!user) return { statusCode: 200, body: "Nothing to remove" };

  await dynamoClient.send(
    new DeleteCommand({
      TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE!,
      Key: { user_id: user.user_id },
    })
  );

  return { statusCode: 200, body: "Disconnected" };
};
