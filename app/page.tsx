"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SignedIn, SignOutButton, useOrganization, useUser } from "@clerk/clerk-react";
import { SignedOut, SignInButton, useSession } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;
  if(organization.isLoaded && user.isLoaded){
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const Session = useSession();
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles, orgId ? {orgId}:"skip");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>;
      })}

      <Button
        onClick={() =>
        {
          if(!orgId) return;
          createFile({
            name: "Hello World",
            orgId
          })
        }
        }
      >
        Click me
      </Button>
    </main>
  );
}
