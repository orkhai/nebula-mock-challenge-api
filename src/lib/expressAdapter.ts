import { APIGatewayProxyHandler } from "aws-lambda";
import { Request, Response } from "express";

export function lambdaToExpress(lambdaHandler: APIGatewayProxyHandler) {
  return async (req: Request, res: Response) => {
    try {
      const event = {
        body: req.body ? JSON.stringify(req.body) : null,
        headers: req.headers as Record<string, string>,
        httpMethod: req.method,
        path: req.path,
        queryStringParameters: req.query as Record<string, string>,
        pathParameters: req.params as Record<string, string>,
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: null,
        requestContext: {} as any,
        resource: "",
        stageVariables: null,
      };

      const result = (await lambdaHandler(
        event as any,
        {} as any,
        () => {}
      )) as any;
      const status = result?.statusCode || 200;
      const body = result?.body ? JSON.parse(result.body) : {};
      res.status(status).json(body);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error?.message || "Internal server error" });
    }
  };
}
