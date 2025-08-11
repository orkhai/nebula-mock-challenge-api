import { APIGatewayProxyHandler } from "aws-lambda";
import dynamoClient from "../../lib/dynamoClient";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const getLeaderboard: APIGatewayProxyHandler = async (event) => {
  try {
    const data = await dynamoClient.send(
      new ScanCommand({
        TableName: process.env.LEADERBOARD_TABLE_NAME,
      })
    );

    const items = data.Items || [];
    items.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    const topScore = items.slice(0, 1);
    return { statusCode: 200, body: JSON.stringify({ topScore }) };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
