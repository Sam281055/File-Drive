import { Button } from "@/components/ui/button";
import {
  OrganizationSwitcher,
  SignedIn,
  SignInButton,
  SignOutButton,
  UserButton
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <div className="relative z-10 border-b py-4 bg-gray-50">
      <div className="items-center container mx-auto justify-between flex">
        <Link href="/" className="flex">
          <Image
            width="50"
            height="50"
            alt="file drive logo"
            src="/Logo-removebg-preview.png"
          />
          <h1 className="text-2xl font-bolt flex my-auto">CloudVault</h1>
        </Link>

        <SignedIn>
        <Button variant={"ghost"}>
          <Link href="/dashboard/files">Your files</Link>
        </Button>
        </SignedIn>

        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
          <SignOutButton>
            <SignInButton>
              <Button>SignIn</Button>
            </SignInButton>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
