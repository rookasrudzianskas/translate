"use server";

import {UserDetails} from "@/app/dashboard/upgrade/page";
import {auth} from "@clerk/nextjs/server";
import {adminDb} from "@/firebase-admin";
import stripe from "@/lib/stripe";
import getBaseUrl from "@/lib/getBaseUrl";

export async function createCheckoutSession(userDetails: UserDetails) {
  auth().protect();
  const { userId } = await auth();

  if(!userId) {
    throw new Error('No user id');
  }

  let stripeCustomerId;
  const user = await adminDb
    .collection("users")
    .doc(userId)
    .get();

  stripeCustomerId = user.data()?.stripeCustomerId;

  if(!stripeCustomerId) {
    // create stripe customer
    const customer = await stripe.customers.create({
      email: userDetails.email,
      name: userDetails.name,
      metadata: {
        userId: userId,
      },
    });

    await adminDb.collection("users").doc(userId).set({
      stripeCustomerId: customer.id,
    });

    stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: 'price_1PgnIDHbxajBDdSkKA4oD9tj',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer: stripeCustomerId,
    success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
    cancel_url: `${getBaseUrl()}/dashboard?upgrade=false`,
  });

  return session.id;
}
