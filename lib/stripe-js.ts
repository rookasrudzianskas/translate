import {loadStripe, Stripe} from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

if(!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Stripe publishable key not found");
}
const getStripe = (): Promise<Stripe | null> => {
  if(!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
}
