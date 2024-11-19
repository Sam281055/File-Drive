import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Download,
  FileMinus,
  FileX,
  ImageIcon,
  Menu,
  ScrollText,
  Star,
  StarsIcon,
  Trash,
  UndoIcon,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { Protect } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const fileUrl = getFileUrl(file.fileId);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the file for our deleteion process. Files
              are deleted periodically
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteFile({ fileId: file._id });
                  toast({
                    variant: "default",
                    title: "File deleted",
                    description: "Your file will be deleted soon",
                  });
                } catch (error) {
                  toast({
                    variant: "destructive",
                    title: "Something went wrong",
                    description:
                      "Your file could not be uploaded, try again later",
                  });
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Menu className="w-6 h-6" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex gap-1 cursor-pointer items-center"
            onClick={async () => {
              window.open(fileUrl, "_blank");
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => toggleFavorite({ fileId: file._id })}
            className="flex gap-1 cursor-pointer items-center"
          >
            {isFavorited ? (
              <Star className="w-4 h-4" fill="yellow" />
            ) : (
              <Star className="w-4 h-4" fill="none" />
            )}
            Favorite
          </DropdownMenuItem>

          <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                if (file.shouldDelete) {
                  restoreFile({
                    fileId: file._id,
                  });
                } else {
                  setIsConfirmOpen(true);
                }
              }}
              className="flex gap-1 cursor-pointer items-center"
            >
              {file.shouldDelete ? (
                <div className="text-green-600 flex gap-1 cursor-pointer items-center">
                  <UndoIcon className="w-4 h-4" /> Restore
                </div>
              ) : (
                <div className="text-red-600 flex gap-1 cursor-pointer items-center">
                  <FileX className="w-4 h-4" /> Delete
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function getFileUrl(fileId: Id<"_storage">): string {
  const previewFile = useQuery(api.files.previewFile, { fileId: fileId });
  return previewFile ? previewFile : "Not Found";
}

function getSubmitDate(fileDate: number): Date {
  const _creationTime = new Date(Math.floor(fileDate));
  return _creationTime;
}

export function FileCard({
  file,
  favorites,
}: {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}) {
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId
  })

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileMinus />,
    csv: <ScrollText />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file._id
  );

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div className="flex justify-center">{typeIcons[file.type]}</div>{" "}
          {file.name}
        </CardTitle>

        <div className="absolute top-2 right-3">
          <FileCardActions isFavorited={isFavorited} file={file} />
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
          {getSubmitDate(file._creationTime).toLocaleDateString("Es")} 
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
