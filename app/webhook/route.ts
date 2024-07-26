import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";
import Stripe from "stripe";
import stripe from "@/lib/stripe";
import {adminDb} from "@/firebase-admin";

export async function POST(req: NextRequest) {
  const headersList = headers();
  const body = await req.text();
  const signature = headersList.get("stripe-signature");

  if(!signature) {
    return new Response("No signature found", {status: 400});
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("No secret found");
    return new Response("No secret found", {status: 400});
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.log(error);
    return new Response("Error parsing the event", {status: 400});
  }

  const getUserDetails = async (customerId: string) => {
    const userDoc = await adminDb
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get()

    if(!userDoc.empty) {
      return userDoc.docs[0];
    }
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      const userDetails = await getUserDetails(customerId);
      if(!userDetails?.id) {
        return new Response("User not found", {status: 400});
      }

      await adminDb.collection('users').doc(userDetails?.id).update({
        hasActiveMembership: true,
      });

      break;
    }
    case "customer.subscription.deleted":
    case "subscription_schedule.canceled": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const userDetails = await getUserDetails(customerId);
      if(!userDetails?.id) {
        return new Response("User not found", {status: 400});
      }

      await adminDb.collection('users').doc(userDetails?.id).update({
        hasActiveMembership: false,
      });
      break;
    }

    default:
      console.log("Unhandled event type", event.type);
  }
  return NextResponse("OK", {status: 200});
}
