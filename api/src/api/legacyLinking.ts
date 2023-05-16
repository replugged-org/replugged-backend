import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { TokenType } from "../utils/auth.js";

const html = (jwt: string): string => `<!doctype html>
<html>
<head>
  <meta charset='utf-8'/>
  <title>Replugged Account Linking</title>
</head>
<body>
<p>Linking...</p>
<img src='http://127.0.0.1:6462/wallpaper.png?jsonweebtoken=${jwt}' style='display: none;' alt='loading'/>
<script>setTimeout(() => document.querySelector('p').innerText = 'You can close this page',1e3)</script>
</body>
</html>`;

function legacy(request: FastifyRequest, reply: FastifyReply): void {
  if (!request.user) {
    reply.redirect("/api/v1/oauth/discord?redirect=/api/v1/users/@me/link/legacy");
    return;
  }

  reply
    .type("text/html")
    .send(html(reply.generateToken({ id: request.user!._id }, TokenType.CLIENT)));
}

/** @deprecated */
export default function (fastify: FastifyInstance): void {
  fastify.get("/users/@me/link/legacy", { config: { auth: { optional: true } } }, legacy);
}
