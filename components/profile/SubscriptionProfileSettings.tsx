"use client";

import Image from "next/image";
import Link from "next/link";

const SubscriptionProfileSettings = ({ userData } :  { userData: WholeUserData }) => {

  return (
    <section className="flex flex-col items-start pl-10 w-full h-full justify-start gap-y-8 pt-10" >

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[140px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 className="text-[22px] font-[600]" >Subscriptions</h3>

        <p className="text-start text-[16px] font-[400]" >
          The subscription model is still in work but will be available soon.
          <br />
          With it you'll be able to access lots of more features!
        </p>

        <Image
          src={"/assets/icons/generic/happy_smiley.svg"}
          alt={"smiley"}
          className="absolute right-6 rounded-full border-gray-600 dark:border-gray-300"
          width={80} height={80}
        />

      </div>

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        
        <h3 className="text-[22px] font-[600]" >Storage</h3>

        <p className="text-start text-[16px] font-[400]" >
          You can only store so many scrapers, but storage can be increased
          <br />
          To see how much it costs please visit <Link href="/pricing?product=scraper_storage" > <span className="underline font-[600]" >Pricing.</span> </Link>
        </p>

        <div className="relative w-full h-auto flex items-start min-h-[34px]" >

          <span className="text-[18px] font-[600]" >{`Current: ${userData.api.rate_limit}`}</span>

          <Link href={"/pricing?product=scraper_storage"} rel="noopener noreferrer" target="_blank" className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Increase storage
          </Link>

        </div>
      </div>

      <div className=" relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 className="text-[22px] font-[600]" >Runtime</h3>

        <p className="text-start text-[16px] font-[400]" >
          Scraper runtime is limited but can be increased.
          <br />
          To see how much it costs please visit <Link href="/pricing?product=rate-limit" > <span className="underline font-[600]" >Pricing.</span> </Link>
        </p>

        <div className="relative w-full h-auto flex items-start min-h-[34px]" >

          <span className="text-[18px] font-[600]" >{`Current: ${userData.subscription.max_scraper_runtime_seconds}sec`}</span>

          <Link href={"/pricing?product=max_storage"} rel="noopener noreferrer" target="_blank" className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Increase runtime
          </Link>
        </div>
      </div>

    </section>
  );
};

export default SubscriptionProfileSettings;