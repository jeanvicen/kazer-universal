import type { IncomingMessage, ServerResponse } from "node:http";
import { vercelApp } from "../server/vercelApp";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return vercelApp(req, res);
}
