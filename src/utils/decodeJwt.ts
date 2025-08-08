import jwt from "jsonwebtoken";

export function decodeJwt(token: string): {
  sub: string;
  name: string;
  "cognito:username": string;
} {
  return jwt.decode(token) as any;
}
