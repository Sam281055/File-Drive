import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileMinus,
  ImageIcon,
  ScrollText
} from "lucide-react";
import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "date-fns"
import { FileCardActions, getFileUrl } from "./file-actions";
import Image from "next/image";

export function FileCard({
  file,
}: {
  file: Doc<"files"> & {isFavorited: boolean};
}) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId
  })

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileMinus />,
    csv: <ScrollText />,
  } as Record<Doc<"files">["type"], ReactNode>;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div className="flex justify-center">{typeIcons[file.type]}</div>{" "}
          {file.name}
        </CardTitle>

        <div className="absolute top-2 right-3">
          <FileCardActions isFavorited={file.isFavorited} file={file} />
        </div>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent>
        {file.type === "image" && (
          <img
            alt={file.name}
            width="300"
            height="100"
            src={
              getFileUrl(file.fileId) ?? (
                <ImageIcon className="w-32 h-32 mx-auto my-auto" />
              )
            }
          />
        )}
        {file.type === "csv" && (
          <ScrollText className="mx-auto my-auto w-32 h-32" />
        )}
        {file.type === "pdf" && (
          <FileMinus className="mx-auto my-auto w-32 h-32" />
        )}
      </CardContent>
      <CardFooter className="flex">
        {/* <Button>Download</Button> */}
        <div className="text-xl text-gray-700">
          <span className="font-semibold">Uploaded on:</span>{" "}
          {formatRelative(new Date(file._creationTime), new Date())} 
          <div className="flex">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image}/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="my-auto px-2">{userProfile?.name}</p>
          </div>
        </div>


      </CardFooter>
    </Card>
  );
}
