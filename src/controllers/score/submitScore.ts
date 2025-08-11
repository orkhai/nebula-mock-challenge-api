import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DeleteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import dynamoClient from "../../lib/dynamoClient";
import { PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../../lib/cognitoClient";
import { websocketClient } from "../../lib/websocketClient";

export const submitScore: APIGatewayProxyHandler = async (event: any) => {
  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };

    const token = authHeader.split(" ")[1];

    const user = await cognitoClient.send(
      new GetUserCommand({ AccessToken: token })
    );

    const attributes = (user.UserAttributes || []).reduce<
      Record<string, string>
    >((acc, a) => {
      acc[a.Name!] = a.Value!;
      return acc;
    }, {});

    const user_id = attributes["sub"];
    const user_name =
      attributes["preferred_username"] ||
      attributes["name"] ||
      "unknown user name";

    const { score } = JSON.parse(event.body || {});
    if (typeof score !== "number") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Score must be a number" }),
      };
    }

    const item = {
      id: uuidv4(),
      user_id,
      user_name,
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
      const connections = await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME,
          ProjectionExpression: "connectionId",
        })
      );

      const items = connections.Items || [];
      console.log("Connections count:", connections.Count);

      const messagePayload = JSON.stringify({
        event: "high_score",
        data: {
          user_id,
          user_name,
          score,
        },
      });

      for (const item of items) {
        const connectionId = item.connectionId as string;
        console.log("Sending to connectionId:", connectionId);

        try {
          await websocketClient.send(
            new PostToConnectionCommand({
              ConnectionId: connectionId,
              Data: Buffer.from(messagePayload),
            })
          );
        } catch (error: any) {
          console.error("PostToConnection error", error);
          if (
            error.name === "GoneException" ||
            error.$metadata?.httpStatusCode === 410
          ) {
            console.log("Deleting stale connectionId:", connectionId);
            await dynamoClient.send(
              new DeleteCommand({
                TableName: process.env.WEBSOCKET_CONNECTIONS_TABLE_NAME!,
                Key: { connectionId },
              })
            );
          }
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Score submitted.", item }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
