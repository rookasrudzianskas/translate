import React from 'react';
import Link from "next/link";
import {SignedIn, UserButton} from "@clerk/nextjs";
import {Button} from "@/components/ui/button";
import {FilePlusIcon} from "lucide-react";

const Header = ({}) => {
  return (
    <div className={'flex justify-between bg-white shadow-sm p-5 border-b'}>
      <Link href={'/dashboard'} className={'text-2xl'}>
        Chat to <span className={'text-indigo-600'}>PDF</span>
      </Link>

      <SignedIn>
        <div className={'flex items-center space-x-2'}>
          <Button asChild variant={'link'} className={'hidden md:flex'}>
            <Link href={'/dashboard/upgrade'}>Pricing</Link>
          </Button>

          <Button asChild variant={'outline'}>
            <Link href={'/dashboard'}>My Documents</Link>
          </Button>

          <Button asChild variant={'outline'} className={'border-indigo-600'}>
            <Link href={'/dashboard/upload'}>
              <FilePlusIcon className={'text-indigo-600'} />
            </Link>
          </Button>
          {/* Upgrade button */}
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
};

export default Header;
// by Rokas with ❤️
