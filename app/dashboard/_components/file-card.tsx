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
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

function FileCardActions({ file, isFavorited }: { file: Doc<"files">, isFavorited:boolean }) {
  const fileUrl = getFileUrl(file.fileId);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();
  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              file and remove your data from our servers.
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
                    description: "Your file is now gone from the system",
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
            {isFavorited ? <Star className="w-4 h-4" fill="yellow"/> : <Star className="w-4 h-4" fill="none"/>}
            Favorite
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsConfirmOpen(true)}
            className="flex gap-1 cursor-pointer text-red-600 items-center"
          >
            <FileX className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
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
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileMinus />,
    csv: <ScrollText />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const isFavorited = favorites.some(
    (favorite)=>favorite.fileId===file._id)
  

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
      <CardFooter>
        {/* <Button>Download</Button> */}
        <p className="text-xl">
          <span className="font-semibold">Submited:</span>{" "}
          {getSubmitDate(file._creationTime).toLocaleDateString("Es")}
        </p>
      </CardFooter>
    </Card>
  );
}
