"use client";

import React, {useEffect, useState, useTransition} from 'react';
import {useUser} from "@clerk/nextjs";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Loader2Icon} from "lucide-react";
import {useCollection} from "react-firebase-hooks/firestore";
import {collection, orderBy, query} from "@firebase/firestore";
import {db} from "@/firebase";

export type Message = {
  id?: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createdAt: Date;
}

const Chat = ({id}: { id: string }) => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  const [snapshot, loading, error] = useCollection(
    user &&
      query(
        collection(db, "users", user?.id, "files", id, "chat"),
        orderBy("createdAt", "asc")
      )
  );

  useEffect(() => {
    if(!snapshot) return;
    console.log("snapshot", snapshot);
    const lastMessage = messages.pop();

  }, [snapshot])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!user) return;


  }

  return (
    <div className={'flex flex-col h-full overflow-scroll'}>
      <div className={'flex-1 w-full'}>
        {}
      </div>
      <form className={'flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75'}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'Ask a question...'}
          className={'w-full'}
          onSubmit={handleSubmit} />
        <Button
          disabled={!input || isPending}

        >
          {isPending ? (
            <Loader2Icon className={'animate-spin h-5 w-5 text-indigo-600'} />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
};

export default Chat;
// by Rokas with ❤️
