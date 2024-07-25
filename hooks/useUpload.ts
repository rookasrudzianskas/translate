"use client";

import {useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import {ref, uploadBytesResumable, getDownloadURL} from "@firebase/storage";
import {db, storage} from "@/firebase";
import {doc, setDoc} from "@firebase/firestore";
export enum StatusText {
  UPLOADING = 'Uploading',
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to storage",
  GENERATING = "Generating summary",
}

export type Status = StatusText[keyof StatusText];

const useUpload = ({}) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if(!file || !user) return;

    //@TODO Free or PRO limitations

    const fileIdToUploadTo = uuidv4();
    const storageRef = ref(storage, `users/${user.id}/files/${fileIdToUploadTo}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed", (snapshot) => {
      const percent = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
      setProgress(percent);
    }, (error) => {
      console.error("Error uploading file:", error);
    }, async () => {
      setStatus(StatusText.UPLOADED);
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      setStatus(StatusText.SAVING);
      await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
        name: file.name,
        size: file.size,
        type: file.type,
        downloadUrl: downloadUrl,
        ref: uploadTask.snapshot.ref.fullPath,
        createdAt: new Date(),
      });
      setStatus(StatusText.GENERATING);
      // Generate AI embeddings

      setFileId(fileIdToUploadTo);
    });
  }

  return {
    progress,
    status,
    fileId,
    handleUpload,
  }
};

export default useUpload;
// by Rokas with ❤️
