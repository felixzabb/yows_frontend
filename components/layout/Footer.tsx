

import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    
    <article className="bg-header-light-bg dark:bg-header-dark-bg w-[100dvw] px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8 z-[1]">
      <aside className="flex flex-wrap justify-center -mx-5 -my-2">
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
          <Link href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
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
      <div className="c_row_elm justify-center mt-8 space-x-6">
        <Link href="#" className="text-gray-400 hover:text-gray-500">
          <Image 
            src="/assets/icons/footer/facebook.svg" 
            alt="Facebook logo link"
            width={24}
            height={24}
          />

        </Link>

        <Link href="#" className="text-gray-400 hover:text-gray-500">
          <Image 
            src="/assets/icons/footer/instagram.svg" 
            alt="Instagram logo link"
            width={24}
            height={24}
          />
        </Link>

        <Link href="#" className="text-gray-400 hover:text-gray-500">
          <Image 
            src="/assets/icons/footer/x.svg" 
            alt="Twitter(X) logo link"
            width={44}
            height={44}
            className="w-[44px] h-[44px]"
          />
        </Link>
        <Link href="#" className="text-gray-400 hover:text-gray-500">
          <Image 
            src="/assets/icons/footer/github.svg" 
            alt="Github logo link"
            width={24}
            height={24}
          />
        </Link>
      </div>
      <p className="mt-8 text-base leading-6 text-center text-gray-400">
          © 2023 Yows, Inc. All rights reserved.
      </p>
    </article>
  );
};

export default Footer;