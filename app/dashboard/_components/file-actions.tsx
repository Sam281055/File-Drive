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
    FileX,
    Menu,
    Star,
    UndoIcon,
  } from "lucide-react";
  import { useState } from "react";
  import { useMutation, useQuery } from "convex/react";
  import { api } from "@/convex/_generated/api";
  import { Doc, Id } from "@/convex/_generated/dataModel";
  import { useToast } from "@/hooks/use-toast";
  import { Protect } from "@clerk/nextjs";
  
export function FileCardActions({
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
    const me = useQuery(api.users.getMe);
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
  
            <Protect condition={(check)=>{return check({role: "org:admin"})|| file.userId === me?._id}} fallback={<></>}>
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
  
export function getFileUrl(fileId: Id<"_storage">): string {
    const previewFile = useQuery(api.files.previewFile, { fileId: fileId });
    return previewFile ? previewFile : "Not Found";
  }