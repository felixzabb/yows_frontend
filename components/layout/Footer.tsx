"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { pingServerCall } from "@utils/apiCalls";

const Footer = () => {

  const [ apiGood, setApiGood ] = useState(true);

  const pingServer = async () => {

    const pingOperation = await pingServerCall({apiKey: "felix12m", check_db: false});

    setApiGood(Boolean(pingOperation.acknowledged));
  };

  useEffect(() => {
    
    pingServer();
  }, []);

  return (
    
    <article className="bg-header-light-bg dark:bg-header-dark-bg max-h-[150px] h-[150px] w-[100dvw] px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
      <aside className="flex flex-row justify-center -mx-5 -my-2">
        <h2 className={`text-base leading-6 px-4 py-2 ${apiGood ? ("text-green-600") : ("text-red-600")}`} >{`Server status: ${apiGood ? ("all good"):("bad")}`}</h2>
        <div className="px-5 py-2">
          <Link href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              About
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Blog
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Team
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link href="/pricing" rel="noopener noreferrer" target="_blank" className="text-base leading-6 text-gray-500">
              Pricing
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Contact
          </Link>
        </div>
        <div className="px-5 py-2">
          <Link href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
              Terms
          </Link>
        </div>
      </aside>
      <div className="flex flex-row items-center justify-center mt-8 space-x-6">

        <Link href="https:/twitter.com" rel="noopener noreferrer" target="_blank" className="text-gray-400 hover:text-gray-500">
          <Image 
            src="/assets/icons/footer/x.svg" 
            alt="Twitter(X) logo link"
            width={44}
            height={44}
            className="w-[44px] h-[44px]"
          />
        </Link>
        <Link href="https://github.com/felixzabb/yows_frontend" rel="noopener noreferrer" target="_blank" className="text-gray-400 hover:text-gray-500">
          <Image 
            src="/assets/icons/footer/github.svg" 
            alt="Github logo link"
            width={24}
            height={24}
          />
        </Link>

      </div>
      <p className="mt-8 text-base leading-6 text-center text-gray-400">
          {`© ${new Date().getFullYear()} Yows, Inc. All rights reserved.`}
      </p>
    </article>
  );
};

export default Footer;