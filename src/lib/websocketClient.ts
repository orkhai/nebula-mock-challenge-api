import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";

export const websocketClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_CONNECTION_URL,
  region: process.env.AWS_REGION,
});
