import { Button } from "@/components/ui/button";
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
  FilePen,
  FileX,
  ImageIcon,
  Menu,
  ScrollText,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

function FileCardActions({ file }: { file: Doc<"files"> }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
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
          <DropdownMenuItem className="flex gap-1 cursor-pointer items-center">
            <Download className="w-4 h-4" />
            Download
          </DropdownMenuItem>

          {/* <DropdownMenuItem className="flex gap-1 cursor-pointer items-center">
            <FilePen className="w-4 h-4" />
            Edit
          </DropdownMenuItem> */}

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

function getFileUrl(fileId: Id<"_storage">):string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({ file }: { file: Doc<"files"> }) {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileMinus />,
    csv: <ScrollText />,
  } as Record<Doc<"files">["type"], ReactNode>;

  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div className="flex justify-center">{typeIcons[file.type]}</div>
          {" "}
          {file.name}
        </CardTitle>

        <div className="absolute top-2 right-3">
          <FileCardActions file={file} />
        </div>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent>
        {file.type === "image" && (
          <Image alt={file.name} width="200" height="100" src={getFileUrl(file.fileId)}/>
        )}
      </CardContent>
      <CardFooter>
        {/* <Button>Download</Button> */}
        <p>Submited: XX/XX/XXXX</p>
      </CardFooter>
    </Card>
  );
}
