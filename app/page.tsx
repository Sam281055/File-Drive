"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SignedIn, SignOutButton } from "@clerk/clerk-react";
import { SignedOut, SignInButton, useSession } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
  const Session = useSession();
  const createFile = useMutation(api.files.createFile);
  const files = useQuery(api.files.getFiles);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <SignedIn>
        <SignOutButton />
        <Button>Sign Out</Button>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal" />
        <Button>Sign In</Button>
      </SignedOut>

      {files?.map(file => {
        return (
          <div key={file._id}>
            {file.name}
          </div>
        )
      })}

      <Button onClick={
        ()=> createFile({
          name: "Hello World"
        })
      }>Click me</Button>
    </main>
  );
}
