import { confirmSignup } from "./controllers/auth/confirmSignup";
import { login } from "./controllers/auth/login";
import { register } from "./controllers/auth/register";
import { getLeaderboard } from "./controllers/score/getLeaderboard";
import { submitScore } from "./controllers/score/submitScore";
import { onConnect } from "./controllers/websocket/onConnect";
import { onDisconnect } from "./controllers/websocket/onDisconnect";

export {
  register,
  confirmSignup,
  login,
  submitScore,
  getLeaderboard,
  onConnect,
  onDisconnect,
};
