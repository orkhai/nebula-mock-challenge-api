import { APIGatewayProxyHandler } from "aws-lambda";
import dynamoClient from "../../lib/dynamoClient";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const onConnect: APIGatewayProxyHandler = async (event) => {
  try {
    const connectionId = event.requestContext.connectionId;
    console.log("onConnect triggered", { connectionId });
    if (!connectionId) return { statusCode: 400, body: "No connectionId" };

    await dynamoClient.send(
      new PutCommand({
        TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME,
        Item: {
          connectionId,
          connectedAt: Date.now(),
        },
      })
    );

    console.log("Connection saved to DynamoDB", { connectionId });

    return { statusCode: 200, body: "connected" };
  } catch (e) {
    return { statusCode: 500, body: "Connection failed" };
  }
};
