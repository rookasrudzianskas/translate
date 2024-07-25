import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {auth} from "@clerk/nextjs/server";
import pineconeClient from "@/lib/pinecone";
import {Index, RecordMetadata} from "@pinecone-database/pinecone";
import {PineconeStore} from "@langchain/pinecone";
import {adminDb} from "@/firebase-admin";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
});

export const indexName = "byrookas";

export async function generateDocs(docId: string) {
  const { userId } = await auth();
  if(!userId) throw new Error('User not authenticated');

  console.log('---------- Fetching the download URL for the file... --------', userId);
  const firebaseRef = await
    adminDb
    .collection("users")
      .doc(userId)
      .collection("files")
      .doc(docId)
      .get();

  const downloadUrl = firebaseRef.data()?.downloadUrl;

  if(!downloadUrl) throw new Error('Download URL not found');

  console.log('---------- Download URL fetched, downloading the file... --------', downloadUrl);

  const response = await fetch(downloadUrl);

  const data = await response.blob();

  console.log('---------- File downloaded, splitting the file into chunks... --------');

  console.log("---------- Loading the pdf.js library... --------");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  console.log("--------- Splitting the document into the smaller parts ---------");
  const splitter = new RecursiveCharacterTextSplitter();

  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`--- Split into ${splitDocs.length} parts --------`);

  return splitDocs;

}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
  if (namespace === null) throw new Error('Namespace cannot be null');
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();

  if(!userId) throw new Error('User not authenticated');

  let pineconeVectorStore;

  console.log('---------- Generating embeddings from the split documents... --------', userId);
  const embeddings = new OpenAIEmbeddings();

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(`--- Namespace ${docId} already exists, reusing the existing namespace. ---`);

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId
    });

    return pineconeVectorStore;
  } else {
    console.log(`--- Namespace ${docId} does not exist, creating a new namespace. ---`);
    const splitDocs = await generateDocs(docId);

    console.log(`------ Storing embeddings in namespace ${docId} in the ${indexName} Pinecone vector store. ---------`);

    pineconeVectorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: docId,
      }
    );

    return pineconeVectorStore;
  }
}
