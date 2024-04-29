import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "../prisma";
// eslint-disable-next-line no-redeclare
import { Request } from "express";

const jwks = createRemoteJWKSet(
  new URL("https://zombies-auth.p3ntest.dev/oidc/jwks")
);

export async function getUserForToken(token: string) {
  if (!token) return null;
  const { payload } = await jwtVerify(token, jwks, {
    // Expected issuer of the token, issued by the Logto server
    issuer: "https://zombies-auth.p3ntest.dev/oidc",
    // Expected audience token, the resource indicator of the current API
    audience: "https://apocalypse.p3ntest.dev/",
  });

  const { sub } = payload;
  const scopePermissions = ((payload.scope as string) ?? "").split(" ");

  return await prisma.user.upsert({
    where: {
      id: sub,
    },
    update: {
      scopePermissions: {
        set: scopePermissions,
      },
    },
    create: {
      id: sub,
      name: "Anonymous",
      scopePermissions: {
        set: scopePermissions,
      },
    },
  });
}

export async function extractUserFromRequest(req: Request) {
  if (!req.headers.authorization) {
    return null;
  }
  if (!req.headers.authorization.startsWith("Bearer ")) {
    return null;
  }
  const token = req.headers.authorization.replace("Bearer ", "");

  const user = await getUserForToken(token);

  return {
    user,
  };
}

export const createContext = async (opts: CreateExpressContextOptions) => {
  return await extractUserFromRequest(opts.req);
};
