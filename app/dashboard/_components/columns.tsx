"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"
import { useQuery } from "convex/react"
import { formatRelative } from "date-fns"
import { FileCardActions } from "./file-actions"

function UserCell({userId}: {userId: Id<"users">}){
    const userProfile = useQuery(api.users.getUserProfile, {
        userId: userId
    });
    return   <div className="flex">
    <Avatar className="w-6 h-6">
      <AvatarImage src={userProfile?.image}/>
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
    <p className="my-auto px-2">{userProfile?.name}</p>
    </div>
}

export const columns: ColumnDef<Doc<"files"> & {isFavorited: boolean}>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "type",
  },
  {
    header: "User",
    cell: ({row})=>{
        return <UserCell userId={row.original.userId} />
    }
  },
  {
    header: "Uploaded On",
    cell: ({row})=>{
        return <div>{formatRelative(new Date(row.original._creationTime), new Date())}</div>
    }
  },
  {
    header: "Actions",
    cell: ({row})=>{
        return <div><FileCardActions file={row.original} isFavorited={row.original.isFavorited}/></div>
    }
  },
]
