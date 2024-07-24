import Image from "next/image";
import {CodeIcon, GlobeIcon, MailIcon, MonitorSmartphoneIcon, ServerCogIcon, ShareIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const features = [
  {
    name: "Store your pdf documents",
    description: "Store your pdf documents in the cloud and share them with your team",
    icon: GlobeIcon,
  },
  {
    name: "Share your documents",
    description: "Share your documents with your team and collaborate on them",
    icon: ShareIcon,
  },
  {
    name: "Collaborate on documents",
    description: "Collaborate on documents with your team and get real-time updates",
    icon: CodeIcon,
  },
  {
    name: "Secure your documents",
    description: "Secure your documents with end-to-end encryption and access control",
    icon: ServerCogIcon
  },
  {
    name: "Customize your experience",
    description: "Customize your experience with themes, templates, and customization options",
    icon: MonitorSmartphoneIcon,
  },
  {
    name: "Integrate with your workflow",
    description: "Integrate with your workflow with built-in integrations and APIs",
    icon: MailIcon,
  },
]

export default function Home() {
  return (
    <main className="overflow-scroll p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600 flex-1">
      <div className={'bg-white py-24 sm:py-32 rounded-md drop-shadow-xl'}>
        <div className={'flex flex-col justify-center items-center max-w-7xl mx-auto px-6 lg:px-8'}>
          <div className={'mx-auto max-w-2xl sm:text-center'}>
            <h2 className={'text-base font-semibold leading-7 text-indigo-600'}>
              Your Interactive Document Solution for Teams
            </h2>
            <p className={'mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl'}>Transform your team's workflow with our solution.</p>
            <p className={'mt-6 text-lg leading-8 text-gray-600'}>
              Introducing{" "}
              <span className={'font-bold text-indigo-600'}>Chat with PDF</span>
              <br />
              <br /> Upload your document, and our chatbot will answer your questions, summarize the content, and even generate summaries for you. Ideal for everyone, <span className={'text-indigo-600'}>Chat with PDF</span>{" "}
              turns static documents into{" "}
              <span className={'font-bold'}>dynamic conversations</span>, enhancing productivity 10x fold effortlessly.
            </p>
          </div>
          <Button asChild className={'mt-10'}>
            <Link href={'/dashboard'}>
              Get Started
            </Link>
          </Button>
        </div>
        <div className={'relative overflow-hidden pt-16'}>
          <div className={'mx-auto max-w-7xl px-6 lg:px-8'}>
            <Image
              alt={'Features'}
              src={'https://i.imgur.com/VciRSTI.jpeg'}
              width={2432}
              height={1442}
              className={'mb-[-0%] rounded-xl shadow-2xl ring-1ring-gray-900/10'}
            />
            <div aria-hidden={'true'} className={'relative'}>
              <div className={'absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]'}>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
