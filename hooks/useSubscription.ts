"use client";

import {useEffect, useState} from "react";
import {useUser} from "@clerk/nextjs";
import {useCollection, useDocument} from "react-firebase-hooks/firestore";
import {collection, doc} from "@firebase/firestore";
import {db} from "@/firebase";

const PRO_LIMIT = 20;
const FREE_LIMIT = 2;

const useSubscription = ({}) => {
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const [isOverFileLimit, setIsOverFileLimit] = useState(false);
  const { user } = useUser();

  // Listen to the user document
  const [snapshot, loading, error] = useDocument(
    user && doc(db, "users", user.id),
    {
      snapshotListenOptions: {
        includeMetadataChanges: true,
      },
    }
  );

  // Listen to the users files collection
  const [filesSnapshot, filesLoading, filesError] = useCollection(
    user && collection(db, "users", user?.id, "files")
  );

  useEffect(() => {
    if(!snapshot) return;

    const data = snapshot.data();
    if(!data) return;

    setHasActiveMembership(data.activeMembership);
  }, [snapshot]);

  useEffect(() => {
    if(!filesSnapshot || hasActiveMembership === null) return;
    const files = filesSnapshot.docs;
    const usersLimit = hasActiveMembership ? PRO_LIMIT : FREE_LIMIT;
  }, [filesSnapshot, hasActiveMembership, PRO_LIMIT, FREE_LIMIT]);

};

export default useSubscription;
// by Rokas with ❤️
