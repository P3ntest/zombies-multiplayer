// @ts-nocheck
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "../prisma";

const jwks = createRemoteJWKSet(
  new URL("https://zombies-auth.p3ntest.dev/oidc/jwks")
);

export const createContext = async (opts: CreateExpressContextOptions) => {
  if (!opts.req.headers.authorization) {
    return null;
  }
  if (!opts.req.headers.authorization.startsWith("Bearer ")) {
    return null;
  }
  const token = opts.req.headers.authorization.replace("Bearer ", "");

  const { payload } = await jwtVerify(token, jwks, {
    // Expected issuer of the token, issued by the Logto server
    issuer: "https://zombies-auth.p3ntest.dev/oidc",
    // Expected audience token, the resource indicator of the current API
    audience: "https://apocalypse.p3ntest.dev/",
  });

  const { sub } = payload;

  const user = await prisma.user.upsert({
    where: {
      id: sub,
    },
    update: {},
    create: {
      id: sub,
      name: "Anonymous",
    },
  });

  return {
    user,
  };
};
