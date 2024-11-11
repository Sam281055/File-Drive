import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <div className="border-b bg-gray-50">
      <div className="items-center container mx-auto justify-between flex">
        <div className="flex">
          <img className="w-20 h-20" src="/Logo-removebg-preview.png" alt="" />
          <h1 className="text-2xl font-serif font-bolt flex my-auto">
            CloudVault
          </h1>
        </div>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
