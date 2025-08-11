import express from "express";
import bodyParser from "body-parser";
import { lambdaToExpress } from "./lib/expressAdapter";
import { register } from "./controllers/auth/register";
const PORT = process.env.PORT || 8000;
import dotenv from "dotenv";
import { login } from "./controllers/auth/login";
import { confirmSignup } from "./controllers/auth/confirmSignup";
import { submitScore } from "./controllers/score/submitScore";
import { getLeaderboard } from "./controllers/score/getLeaderboard";
dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post("/register", lambdaToExpress(register));
app.post("/confirm-signup", lambdaToExpress(confirmSignup));
app.post("/login", lambdaToExpress(login));
app.post("/submit-score", lambdaToExpress(submitScore));
app.get("/top-score", lambdaToExpress(getLeaderboard));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

export default app;
