import { ScanCommand } from "@aws-sdk/client-dynamodb";
import dynamoClient from "../../lib/dynamoClient";

export const getLeaderboard = async () => {
  try {
    const data = await dynamoClient.send(
      new ScanCommand({
        TableName: process.env.LEADERBOARD_TABLE_NAME,
      })
    );

    const topScore = data.Items?.sort((a: any, b: any) => b.score - a.score)[0];

    return {
      statusCode: 200,
      body: JSON.stringify({ topScore }),
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
