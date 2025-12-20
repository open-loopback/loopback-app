import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { cache } from 'react';

import { auth } from '@clerk/nextjs/server';

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return {
    userId,
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
