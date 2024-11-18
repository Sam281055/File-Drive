"use client";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FileCard } from "@/app/dashboard/_components/file-card";
import { SearchBar } from "@/app/dashboard/_components/SearchBar";
import { UploadButton } from "@/app/dashboard/_components/upload-button";

export function FileBrowser({title, favoritesOnly}:{title:string, favoritesOnly?:boolean}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  
  const favorites = useQuery(api.files.getAllFavorites, orgId ? {orgId}:'skip')

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites:favoritesOnly } : "skip");
  
  const isLoading = files === undefined;
  return (
    <>
      <div>
        {isLoading && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="h-32 w-32 animate-spin text-gray-400" />
            <div className="text-2xl">Loading...</div>
          </div>
        )}

        {!isLoading && !query && files.length === 0 && (
          <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Image
              alt="an image of a picture and directory icon"
              width="300"
              height="300"
              src="/empty.svg"
            />
            <div className="text-2xl">You have not files, upload one now</div>
            <UploadButton />
          </div>
        )}

        {!isLoading && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-bold">{title}</h3>
              <UploadButton />
            </div>
            <SearchBar query={query} setQuery={setQuery} />

            <div className="grid grid-cols-4 gap-4">
              {files?.map((file) => {
                return <FileCard favorites={favorites ?? []} key={file._id} file={file} />;
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}