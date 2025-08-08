import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { decodeJwt } from "../../utils/decodeJwt";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoClient from "../../lib/dynamoClient";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

export const submitScore: APIGatewayProxyHandler = async (event: any) => {
  const authHeader = event.headers.Authorization || event.headers.authorization;

  if (!authHeader)
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };

  const token = authHeader.split(" ")[1];
  const user = decodeJwt(token);
  const { score } = JSON.parse(event.body);

  const item = {
    id: uuidv4(),
    user_id: user.sub,
    user_name: user.name || "unknown user",
    score: Number(score),
    timestamp: Date.now(),
  };

  await dynamoClient.send(
    new PutCommand({
      TableName: process.env.LEADERBOARD_TABLE_NAME ?? "",
      Item: item,
    })
  );

  if (score > 1000) {
    const connection = await dynamoClient.send(
      new GetCommand({
        TableName: "websocket_connections",
        Key: { user_id: user.sub },
      })
    );

    const connectionId = connection.Item?.connectionId;

    if (connectionId) {
      await sendWebSocketMessage(connectionId, {
        type: "notification",
        message: "🎉 Congrats! You scored over 1000!",
      });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Score submitted.", item }),
  };
};

const sendWebSocketMessage = async (connectionId: string, message: any) => {
  const client = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKET_CONNECTION_URL,
  });

  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: Buffer.from(JSON.stringify(message)),
  });

  await client.send(command);
};
