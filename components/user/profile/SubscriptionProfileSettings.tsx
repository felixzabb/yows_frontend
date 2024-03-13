"use client";

import Image from "next/image";
import Link from "next/link";

const SubscriptionProfileSettings = ({userData, push}) => {

  return (
    <section id="subscriptions-settings-container" className="flex flex-col items-start pl-10 w-full h-full justify-start gap-y-8 pt-10" >

      <div id="not-available-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[140px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="not-available-heading" className="text-[22px] font-[600]" >Subscriptions</h3>

        <p id="not-available-description" className="text-start text-[16px] font-[400]" >
          The subscription model is still in work but will be available soon.
          <br />
          With it you'll be able to access lots of more features!
        </p>

        <Image
          src={"/assets/icons/generic/happy_smiley.svg"}
          alt={"smiley"}
          className="absolute right-6 rounded-full border-gray-600 dark:border-gray-300"
          width={80}
          height={80}
        />

      </div>

      <div id="rate-limit-setting-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="rate-limit-setting-heading" className="text-[22px] font-[600]" >Storage</h3>

        <p id="rate-limit-setting-description" className="text-start text-[16px] font-[400]" >
          You can only store so many scrapers, but storage can be increased
          <br />
          To see how much it costs please visit <Link href="/pricing?product=scraper_storage" > <span className="underline font-[600]" >Pricing.</span> </Link>
        </p>

        <form id="rate-limit-setting-form" onSubmit={(e) => {e.preventDefault()}} className="relative w-full h-auto flex items-start min-h-[34px]" >

          <span className="text-[18px] font-[600]" >{`Current: ${userData.api.rate_limit}`}</span>

          <button disabled id="increase-storage" onClick={() => { push("/buy?product=rate_limit"); }}
            className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Increase storage
          </button>
        </form>
      </div>

      <div id="max-runtime-setting-wrapper" className=" relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="max-runtime-setting-heading" className="text-[22px] font-[600]" >Runtime</h3>

        <p id="max-runtime-setting-description" className="text-start text-[16px] font-[400]" >
          Scraper runtime is limited but can be increased.
          <br />
          To see how much it costs please visit <Link href="/pricing?product=rate-limit" > <span className="underline font-[600]" >Pricing.</span> </Link>
        </p>

        <form id="max-runtime-setting-form" onSubmit={(e) => {e.preventDefault()}} className="relative w-full h-auto flex items-start min-h-[34px]" >

          <span className="text-[18px] font-[600]" >{`Current: ${userData.subscription.max_runtime}sec`}</span>

          <button disabled id="increase-max-runtime" onClick={() => { push("/buy?product=max-runtime"); }}
            className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Increase runtime
          </button>
        </form>
      </div>

    </section>
  );
};

export default SubscriptionProfileSettings;