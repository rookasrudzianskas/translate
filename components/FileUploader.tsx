"use client";

import React, {useCallback, useEffect} from 'react';
import {useDropzone} from "react-dropzone";
import {CheckCircleIcon, CircleArrowDown, HammerIcon, RocketIcon, SaveIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import useUpload, {StatusText} from "@/hooks/useUpload";
import useSubscription from "@/hooks/useSubscription";
import {useToast} from "@/components/ui/use-toast";

const FileUploader = ({}) => {
  const  { progress, status, fileId, handleUpload } = useUpload();
  const { hasActiveMembership, filesLoading , isOverFileLimit} = useSubscription();
  const { toast } = useToast();
  const router = useRouter();
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if(file) {
      if (!isOverFileLimit && !filesLoading) {
        await handleUpload(file);
      }
    } else {
      toast.error({
        message: "No file selected",
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [handleUpload]);

  const statusIcons: {
    [key in StatusText]: JSX.Element
  } = {
    [StatusText.UPLOADING]: <RocketIcon className={'text-indigo-600 h-20 w-20'} />,
    [StatusText.UPLOADED]: <CheckCircleIcon className={'text-indigo-600 h-20 w-20'} />,
    [StatusText.SAVING]: <SaveIcon className={'text-indigo-600 h-20 w-20'} />,
    [StatusText.GENERATING]: <HammerIcon className={'text-indigo-600 h-20 w-20 animate-bounce'} />,
  }

  useEffect(() => {
    if(fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router])

  const {getRootProps, getInputProps, isDragActive, isFocused, isDragAccept} = useDropzone(
    {
      onDrop,
      maxFiles: 1,
      accept: {
        "application/pdf": [".pdf"]
      },
    });

  const uploadInProgress = progress !== null && progress >= 0 && progress <= 100;

  return (
    <div className={'flex flex-col gap-4 items-center max-w-7xl mx-auto'}>
      {/* Loading section */}
      {uploadInProgress && (
        <div className={'mt-32 flex flex-col justify-center items-center gap-5'}>
          <div
            className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4 ${progress === 100 && "hidden"}`}
            role={'progressbar'}
            style={{ "--value": progress, "--size": "12rem", "--thickness": "1.3rem" }}
          >
            {progress} %
          </div>

          {
            statusIcons[status!]
          }

          <p className={'text-indigo-600 animate-pulse'}>{status!}</p>
        </div>
      )}
      {!uploadInProgress && (
        <div {...getRootProps()}
             className={`p-10 border-indigo-600  text-indigo-600 border-2 border-dashed mt-10 w-[90%] rounded-lg h-96 flex items-center justify-center ${isFocused || isDragAccept ? "bg-indigo-300" : "bg-indigo-100"}`}
        >
          <input {...getInputProps()} />
          <div className={'flex flex-col items-center justify-center'}>
            {
              isDragActive ? (
                <>
                  <RocketIcon className={'h-20 w-20 animate-bounce'}/>
                  <p>Drop the files here ...</p>
                </>
              ) : (
                <>
                  <CircleArrowDown className={'h-20 w-20 animate-bounce'}/>
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
// by Rokas with ❤️
