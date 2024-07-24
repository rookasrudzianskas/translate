"use client";

import React from 'react';
import {Button} from "@/components/ui/button";
import {PlusCircleIcon} from "lucide-react";
import {useRouter} from "next/navigation";

const PlaceholderDocument = ({}) => {
  const router = useRouter();

  const handleClick = () => {
    // Check if user is PRO or free tier, and if they are over file limit, push to upgrade page
    router.push('/dashboard/upload');
  }

  return (
    <Button onClick={handleClick} className={'flex flex-col items-center  w-64 h-80 rounded-xl bg-gray-200' +
      ' drop-shadow-md' +
      ' text-gray-400'}>
      <PlusCircleIcon className={'h-16 w-16'} />
      <p>
        Add a document
      </p>
    </Button>
  );
};

export default PlaceholderDocument;
// by Rokas with ❤️
