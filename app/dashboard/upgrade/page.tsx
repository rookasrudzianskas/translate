"use client";

import React, {useTransition} from 'react';
import {CheckIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/stripe-js";
import {createCheckoutSession} from "@/actions/createCheckoutSession";

export type UserDetails = {
  email: string;
  name: string;
}

const PricingPage = ({}) => {
  const { user } = useUser();
  const router = useRouter();
  const {hasActiveMembership, loading} = useSubscription();
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    if(!user) return;
    const userDetails: UserDetails = {
      email: user.primaryEmailAddress?.toString()!,
      name: user.fullName!,
    }

    startTransition(async () => {
      const stripe = await getStripe();

      if(hasActiveMembership) {
        const stripePortalUrl = await createStripePortal();
      }

      const sessionId = await createCheckoutSession(userDetails);

      await stripe?.redirectToCheckout({
        sessionId: sessionId,
      });
    });
  }

  return (
    <div className={'bg-white py-24 sm:py-32'}>
      <div className={'max-w-4xl mx-auto text-center'}>
        <div>
          <h2 className={'text-base font-semibold leading-7 text-indigo-600'}>
            Pricing
          </h2>
          <p className={'mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'}>
            Supercharge your Document Companion
          </p>
        </div>
        <p className={'mx-auto mt-6 max-w-2xl px-10 text-center text-lg leading-8 text-gray-600'}>
          Choose an upgrade plan that suits your needs and budget.
          That is the best way to get the most out of your Document Companion.
        </p>
        <div className={'max-w-md mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 md:max-w-2xl gap-8 lg:max-w-4xl'}>
          <div className={'ring-1 ring-gray-200 p-8 h-fit pb-12 rounded-3xl'}>
            <h3 className={'flex-start flex text-lg font-semibold leading-8 text-gray-900'}>Starter Plan</h3>
            <p className={'flex-start flex  mt-4 text-sm leading-6 text-gray-600'}>
              Explore Core Features at No Cost
            </p>
            <p className={'mt-6 flex items-baseline gap-x-1'}>
              <span className={'text-4xl font-bold tracking-tight text-gray-900'}>Free</span>
            </p>

            <ul role={'list'} className={'mt-8 space-y-3 tet-sm leading-6 text-gray-600'}>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                2 Documents
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Up to 3 messages per document
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Try out the AI Chat functionality
              </li>
            </ul>
          </div>
          <div className={'ring-2 ring-indigo-600 rounded-3xl p-8'}>
            <h3 className={'flex text-lg font-semibold leading-8 text-indigo-600'}>Pro Plan</h3>
            <p className={'flex mt-4 text-sm leading-6 text-gray-600'}>
              Maximize your productivity with our Pro Plan
            </p>
            <p className={'mt-6 flex items-baseline gap-x-1'}>
              <span className={'text-4xl font-bold tracking-tight text-gray-900'}> $5.99</span>
              <span className={'text-sm font-semibold leading-6 text-gray-600'}> / per month</span>
            </p>

            <Button className={'bg-indigo-600 w-full text-white shadow-sm hover:bg-indigo-500 mt-6 block rounded-md' +
              ' px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2' +
              ' focus-visible:outline-offset-2 focus-visible:outline-indigo-600'}
                    disabled={loading || isPending}
                    onClick={handleUpgrade}
            >
              {isPending || loading ? "Loading..." : hasActiveMembership ? "Manage Plan" : "Upgrade to PRO"}
            </Button>

            <ul role={'list'} className={'mt-8 space-y-3 tet-sm leading-6 text-gray-600'}>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Unlimited Documents
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Unlimited Conversations
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Try out the AI Chat functionality
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Functionality with Memory Recall
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Customize your experience with themes
              </li>
              <li className={'flex gap-x-3'}>
                <CheckIcon className={'h-6 w-5 flex-none text-indigo-600'} />
                Integrate with your workflow
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;
// by Rokas with ❤️
