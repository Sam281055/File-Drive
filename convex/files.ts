import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";

export const generateUploadUrl = mutation(async (ctx)=>{
  const identity = await ctx.auth.getUserIdentity();

  if(!identity){
      throw new ConvexError('you must be logged in to upload a file')
  }
  return await ctx.storage.generateUploadUrl();
});

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
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity){
        throw new ConvexError('you must be logged in to upload a file')
    }
    const hasAccess = await hasAccessToOrg(identity.tokenIdentifier, args.orgId, ctx);

    if(!hasAccess){
      throw new ConvexError("You do not have access to this organization")
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type
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

export const deleteFile = mutation({
  args: {fileId: v.id("files")},
  async handler(ctx, args){
    const identity = await ctx.auth.getUserIdentity();
    if(!identity){
        throw new ConvexError("you do not have access to this org");
    }
    const file = await ctx.db.get(args.fileId);
    if(!file){
      throw new ConvexError("this file does not exist");
    }

    const hasAccess = await hasAccessToOrg(
      identity.tokenIdentifier,
      file.orgId,
      ctx
    );
    
    if(!hasAccess){
      throw new ConvexError("you do not have access to delete this file");
    }

    await ctx.db.delete(args.fileId);
  }
});

export const previewFile = query({
  args: {
    fileId: v.any()
  },
  async handler(ctx, args){
    const blob = await ctx.storage.getUrl(args.fileId);
    if(blob === null)return null;
    return blob.toString();
  }
})