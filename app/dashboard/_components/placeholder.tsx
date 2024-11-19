import Image from "next/image";
import { UploadButton } from "./upload-button";

export default function Placeholder(){
    return (
        <div className="flex flex-col gap-8 w-full items-center mt-10">
        <Image
          alt="an image of a picture and directory icon"
          width="250"
          height="250"
          src="/empty.svg"
        />
        <div className="text-2xl">You have not files, upload one now</div>
        <UploadButton />
      </div>
    )
}