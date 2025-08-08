import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const websocketClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_CONNECTION_URL,
});

export async function sendWebSocketMessage(connectionId: string, message: any) {
  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: JSON.stringify(message),
  });

  await websocketClient.send(command);
}
