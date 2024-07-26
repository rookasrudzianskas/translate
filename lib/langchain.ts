import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {auth} from "@clerk/nextjs/server";
import pineconeClient from "@/lib/pinecone";
import {Index, RecordMetadata} from "@pinecone-database/pinecone";
import {PineconeStore} from "@langchain/pinecone";
import {adminDb} from "@/firebase-admin";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {createHistoryAwareRetriever} from "langchain/dist/chains/history_aware_retriever";
import {createStuffDocumentsChain} from "langchain/dist/chains/combine_documents";
import {createRetrievalChain} from "langchain/dist/chains/retrieval";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o",
});

export const indexName = "byrookas";

const fetchMessagesFromDB = async (docId: string) => {
  const { userId } = await auth();
  if(!userId) throw new Error('User not authenticated');

  console.log('---------- Fetching the chat messages from the DB... --------', userId);

  const chats = await adminDb
    .collection("users")
      .doc(userId)
      .collection("files")
      .doc(docId)
      .collection("chat")
      .orderBy("createdAt", "desc")
      .get();

  console.log('---------- Chat messages fetched, processing them... --------', chats.docs.length);

  const chatHistory = chats.docs.map((doc) =>
    doc.data().role === "human"
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );

  console.log('---------- Chat messages processed, returning them... --------', chatHistory.length);
  console.log(chatHistory.msg((msg) => msg.content.toString()));

  return chatHistory;
}

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

const generateLangchainCompletion = async (docId: string, question: string) => {
  let pineconeVectorStore;

  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

  console.log(`--- Asking question to Langchain ${question} ---`);
  if(!pineconeVectorStore) throw new Error('Pinecone vector store not found');

  console.log('Creating Retriever-----');
  const retriever = pineconeVectorStore.asRetriever();

  const chatHistory = await fetchMessagesFromDB(docId);

  console.log('--------- Creating the correct prompt template --------');

  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...chatHistory,
    ["user", "{input}"],
    [
      "user",
      "Given the above conversation, generate a search query to look up in order to get information relevant to the" +
      " conversation",
    ],
  ]);

  console.log("-------- Creating a history aware retrieval chain --------");

  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  console.log("------------- Defining the prompt template for answering the question --------");

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user's questions based on the below context:\n\n{context}"
    ],
    ...chatHistory,

    ["user", "{input}"],
  ]);

  console.log('------------ Creating a document combined chain ------------');

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm: model,
    prompt: historyAwareRetrievalPrompt,
  });

  console.log('------------ Calling the main retrieval chain ------------');

  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  console.log('------------- Running the chain with a simple conversation ------------');
  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: question,
  });
};
