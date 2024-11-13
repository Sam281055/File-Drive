import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";

async function hasAccessToOrg(tokenIdentifier:string, orgId:string, ctx:QueryCtx|MutationCtx){
  const user = await getUser(ctx, tokenIdentifier);

  const hasAccess = user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  if(!hasAccess){
    throw new ConvexError("You do not have access to this organization")
  }
  return hasAccess;
}


export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string()
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity){
        throw new ConvexError('you must be logged in to upload a file')
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    const hasAccess = await hasAccessToOrg(identity.tokenIdentifier, args.orgId, ctx);

    if(!hasAccess){
      throw new ConvexError("You do not have access to this organization")
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string()
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    console.log(identity);
    
    if(!identity){
        return [];
    }
    const hasAccess = await hasAccessToOrg(identity.tokenIdentifier, args.orgId, ctx);
    if(!hasAccess){
      return [];
  }
    return ctx.db.query("files").withIndex('by_orgId', q => q.eq('orgId', args.orgId)).collect();
  },
});
