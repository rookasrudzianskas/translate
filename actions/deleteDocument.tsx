"use server";

import {auth} from "@clerk/nextjs/server";
import {adminDb, adminStorage} from "@/firebase-admin";
import {revalidatePath} from "next/cache";
import pineconeClient from "@/lib/pinecone";
import {indexName} from "@/lib/langchain";

export async function deleteDocument(docId: string) {
  auth().protect();
  const { userId } = await auth();

  await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .delete();

  await adminStorage
    .bucket(process.env.FIREBASE_STORAGE_BUCKET)
    .file(`users/${userId}/files/${docId}`)
    .delete();

  const index = await pineconeClient.index(indexName);
  await index.namespace(docId).deleteAll();

  revalidatePath('/dashboard');
}
