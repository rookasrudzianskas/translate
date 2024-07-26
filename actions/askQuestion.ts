'use server'

import { Message } from '@/components/Chat'
import { generateLangchainCompletion } from '@/lib/langchain'
import { auth } from '@clerk/nextjs/server'
import {adminDb} from "@/firebase-admin";
import {FREE_LIMIT, PRO_LIMIT} from "@/hooks/useSubscription";
export async function askQuestion(id: string, question: string) {
	auth().protect()

	const { userId } = await auth()

	const chatRef = adminDb
		.collection('users')
		.doc(userId!)
		.collection('files')
		.doc(id)
		.collection('chat')

	const chatSnapshot = await chatRef.get()
	const userMessages = chatSnapshot.docs.filter(
		(doc) => doc.data().role === 'human'
	);

  const userRef = await adminDb.collection('users').doc(userId!).get();

  if(!userRef.data()?.hasActiveMembership) {
    if (userMessages.length >= FREE_LIMIT) {
      return { success: false, message: 'You have reached the free limit of documents.' }
    }
  }

  if(!userRef.data()?.hasActiveMembership && userMessages.length >= PRO_LIMIT) {
    return { success: false, message: 'You have reached the pro limit of documents.' }
  }

	const userMessage: Message = {
		role: 'human',
		message: question,
		createdAt: new Date(),
	}

	await chatRef.add(userMessage)

	const reply = await generateLangchainCompletion(id, question)

	const aiMessage: Message = {
		role: 'ai',
		message: reply,
		createdAt: new Date(),
	}

	await chatRef.add(aiMessage)

	return { success: true, message: null }
}
