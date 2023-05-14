import type { User } from "../../types/users";
import type { TokenType, JWTPayload } from "./utils/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    jwtPayload: JWTPayload | null;
    user: User | null;
  }

  interface FastifyReply {
    generateToken: (payload: JWTPayload, type: TokenType) => string;
  }

  interface FastifyContextConfig {
    auth?: {
      optional?: boolean;
      permissions?: number;
      allowClient?: boolean;
    };
  }

  export type ConfiguredReply<TFReply extends FastifyReply, TConfig> = TFReply extends FastifyReply<
    infer TServer,
    infer TRequest,
    infer TReply,
    infer TGeneric
  >
    ? FastifyReply<TServer, TRequest, TReply, TGeneric, TConfig>
    : never;
}
