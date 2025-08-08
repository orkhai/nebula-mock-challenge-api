import crypto from "crypto";

export function getSecretHash(username: string): string {
  return crypto
    .createHmac("SHA256", process.env.COGNITO_APP_SECRET ?? "")
    .update(username + (process.env.COGNITO_APP_CLIENT_ID ?? ""))
    .digest("base64");
}
