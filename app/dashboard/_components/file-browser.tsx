"use client";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Grid, Loader2, TableOfContents } from "lucide-react";
import { useState } from "react";
import { FileCard } from "@/app/dashboard/_components/file-card";
import { SearchBar } from "@/app/dashboard/_components/SearchBar";
import { UploadButton } from "@/app/dashboard/_components/upload-button";
import Placeholder from "./placeholder";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";

export function FileBrowser({
  title,
  favoritesOnly,
  deletedOnly,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");
  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );

  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, type: type === 'all'? undefined : type, query, favoritesOnly, deletedOnly } : "skip"
  );
  const isLoading = files === undefined;

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorited: (favorites ?? []).some(
        (favorite) => favorite.fileId === file._id
      ),
    })) ?? [];

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-4xl font-bold">{title}</h3>
          <SearchBar query={query} setQuery={setQuery} />

          <UploadButton />
        </div>

        <Tabs defaultValue="grid">
          <div className="flex justify-between items-center">
            <TabsList className="mb-4">
              <TabsTrigger className="flex gap-2 items-center" value="grid">
                <Grid />
              </TabsTrigger>
              <TabsTrigger className="flex gap-2 items-center" value="table">
                <TableOfContents />
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2 items-center">
              <Label htmlFor="type-select">Type Filter</Label>
              <Select value={type} onValueChange={(newType)=>{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setType(newType as any);
              }}>
                <SelectTrigger id="type-select" className="w-[180px]" defaultValue={"all"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-8 w-full items-center mt-24">
              <Loader2 className="h-32 w-32 animate-spin text-gray-400" />
              <div className="text-2xl">Loading...</div>
            </div>
          )}
          <TabsContent value="grid">
            <div className="grid grid-cols-4 gap-4">
              {modifiedFiles?.map((file) => {
                return <FileCard key={file._id} file={file} />;
              })}
            </div>
          </TabsContent>
          <TabsContent value="table">
            <DataTable columns={columns} data={modifiedFiles} />
          </TabsContent>
        </Tabs>

        {files?.length === 0 && <Placeholder />}
      </div>
    </>
  );
}
