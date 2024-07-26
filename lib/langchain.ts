import { createRetrievalChain } from 'langchain/chains/retrieval'

import { auth } from '@clerk/nextjs/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { Index, RecordMetadata } from '@pinecone-database/pinecone'
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents'
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import pineconeClient from './pinecone'
import {adminDb} from "@/firebase-admin";

const model = new ChatOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	modelName: 'gpt-4o-mini',
})

export const indexName = 'pdfwhisperer'

async function fetchMessagesFromDB(docId: string) {
	const { userId } = auth()

	if (!userId) {
		throw new Error('No user id')
	}

	const chats = await adminDb
		.collection('users')
		.doc(userId)
		.collection('files')
		.doc(docId)
		.collection('chat')
		.orderBy('createdAt', 'desc')
		.get()

	const chatHistory = chats.docs.map((doc) => {
		return doc.data()?.role === 'human'
			? new HumanMessage(doc.data().message)
			: new AIMessage(doc.data().message)
	})

	return chatHistory
}

export async function generateDocs(docId: string) {
	const { userId } = auth()

	if (!userId) {
		throw new Error('No user id')
	}

	const firebaseReference = await adminDb
		.collection('users')
		.doc(userId)
		.collection('files')
		.doc(docId)
		.get()
	const downloadUrl = firebaseReference.data()?.downloadUrl

	if (!downloadUrl) {
		throw new Error('No download url')
	}

	const response = await fetch(downloadUrl)

	const data = await response.blob()

	const loader = new PDFLoader(data)
	const docs = await loader.load()

	// Split the pdf text into chunks
	const splitter = new RecursiveCharacterTextSplitter()
	const splitDocs = await splitter.splitDocuments(docs)

	return splitDocs
}

export async function namespaceExists(
	index: Index<RecordMetadata>,
	namespace: string
) {
	if (namespace === null) throw new Error('Namespace is null')
	const { namespaces } = await index.describeIndexStats()
	return namespaces?.[namespace] !== undefined
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
	const { userId } = auth()

	if (!userId) {
		throw new Error('No user id')
	}

	let pineconeVectorStore

	const embeddings = new OpenAIEmbeddings()

	const index = await pineconeClient.index(indexName)
	const namespaceAlreadyExists = await namespaceExists(index, docId)

	if (namespaceAlreadyExists) {
		console.log('namespace already exists, reusing')

		pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
			pineconeIndex: index,
			namespace: docId,
		})

		return pineconeVectorStore
	} else {
		const splitDocs = await generateDocs(docId)

		// store in vector store
		pineconeVectorStore = await PineconeStore.fromDocuments(
			splitDocs,
			embeddings,
			{ pineconeIndex: index, namespace: docId }
		)

		return pineconeVectorStore
	}
}

const generateLangchainCompletion = async (docId: string, question: string) => {
	let pineconeVectoreStore

	pineconeVectoreStore = await generateEmbeddingsInPineconeVectorStore(docId)

	if (!pineconeVectoreStore) {
		throw new Error('No pinecone vector store')
	}

	const retriever = pineconeVectoreStore.asRetriever()

	const chatHistory = await fetchMessagesFromDB(docId)

	// prompt template
	const historyAwarePrompt = ChatPromptTemplate.fromMessages([
		...chatHistory,
		['user', '{input}'],
		[
			'user',
			'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
		],
	])

	const historyAwareRetrieverChain = await createHistoryAwareRetriever({
		llm: model,
		retriever,
		rephrasePrompt: historyAwarePrompt,
	})

	const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
		[
			'system',
			"Answer the user's questions based on the below context:\n\n{context}",
		],
		...chatHistory,
		['user', '{input}'],
	])

	const historyAwareCombineDocsChain = await createStuffDocumentsChain({
		llm: model,
		prompt: historyAwareRetrievalPrompt,
	})

	const conversationalRetrievalChain = await createRetrievalChain({
		retriever: historyAwareRetrieverChain,
		combineDocsChain: historyAwareCombineDocsChain,
	})

	const reply = await conversationalRetrievalChain.invoke({
		chat_history: chatHistory,
		input: question,
	})

    console.log('ai reply is', reply);

	return reply.answer
}

export { generateLangchainCompletion, model }
