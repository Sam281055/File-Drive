"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SignedIn, SignOutButton } from "@clerk/clerk-react";
import { SignedOut, SignInButton, useSession } from "@clerk/nextjs";
import { useMutation } from "convex/react";

export default function Home() {
  const Session = useSession();
  const createFile = useMutation(api.files.createFile);
  return (
    <main className="flex mx-auto my-auto w-full h-full">
      <SignedIn>
        <SignOutButton />
        <Button>Sign Out</Button>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal" />
        <Button>Sign In</Button>
      </SignedOut>

      <Button onClick={
        ()=> createFile({
          name: "Hello World"
        })
      }>Click me</Button>
    </main>
  );
}
