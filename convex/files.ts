import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }
  return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(orgId: string, ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  const hasAccess =
    user.orgIds.some((item) => item.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }
  return { user };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(args.orgId, ctx);

    if (!hasAccess) {
      throw new ConvexError("You do not have access to this organization");
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      userId: hasAccess.user._id
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
    type: v.optional(fileTypes),
    query: v.optional(v.string()),
    favoritesOnly: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    const query = args.query;
    if (!identity) {
      return [];
    }
    const hasAccess = await hasAccessToOrg(args.orgId, ctx);
    if (!hasAccess) {
      return [];
    }
    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    if (query) {
      files = files.filter((file) => file.name.includes(query));
    }
    if (args.favoritesOnly) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        )
        .collect();
      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }
    if (args.deletedOnly) {
      files = files.filter((file) => file.shouldDelete);
    } else {
      files = files.filter((file) => !file.shouldDelete);
    }
    if(args.type){
      files = files.filter((file)=> file.type === args.type);
    }
    return files;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("No access to file");
    }
    assertCanDeleteFile(access.user, access.file);
    await ctx.db.patch(args.fileId, {
      shouldDelete: true,
    });
  },
});

function assertCanDeleteFile(user: Doc<"users">, file:Doc<"files">){
  const canDelete = file.userId === user._id ||
      user.orgIds.find((org) => org.orgId === file.orgId)
        ?.role === "admin";

    if (!canDelete) {
      throw new ConvexError("You have no access to delete this file");
    }
}

export const deleteAllFiles = internalMutation({
  args: {},
  async handler(ctx) {
    const files = await ctx.db
      .query("files")
      .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
      .collect();
    await Promise.all(files.map(async(file)=>{
      await ctx.storage.delete(file.fileId);
      return await ctx.db.delete(file._id)
    }))
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);
    if (!access) {
      throw new ConvexError("No access to file");
    }
    assertCanDeleteFile(access.user, access.file);
    await ctx.db.patch(args.fileId, {
      shouldDelete: false,
    });
  },
});

export const previewFile = query({
  args: {
    fileId: v.any(),
  },
  async handler(ctx, args) {
    const blob = await ctx.storage.getUrl(args.fileId);
    if (blob === null) return null;
    return blob.toString();
  },
});

export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(args.orgId, ctx);

    if (!hasAccess) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex(
        "by_userId_orgId_fileId",
        (q) => q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        // .eq("fileId", hasAccess._id)
      )
      .collect();
    return favorites;
  },
});

export const toggleFavorite = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("no access to file");
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id)
      )
      .first();

    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: access.file._id,
        userId: access.user._id,
        orgId: access.file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);
  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(file.orgId, ctx);

  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}