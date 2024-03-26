import Link from "next/link";
import { hideElement } from "@utils/elementFunction";

const NotSignedInDialog = ({message} : {message : string}) => {

  return (
    <div id="not-signed-in-container" className="flex flex-col items-center gap-y-2" >
      
      <h2 id="not-signed-in-heading" className="text-[20px] font-[500] font-inter w-full text-center" >
        You are not signed in!
      </h2>

      <p id="not-signed-in-message" className="text-[18px] font-[400] w-full text-center" >
        {message}
      </p>

      <div id="not-signed-in-links" className="flex flex-row items-center justify-between w-[80%] h-[50px]" > 
        <Link onClick={() => {hideElement({elementId: "document-overlay-container"}); }} href="/signup?mode=in" prefetch className="border-2 border-gray-600 dark:border-gray-300 px-1 text-[20px] font-[500] rounded-lg dark:hover:animate-navColorFadeLight dark:hover:text-text-color-light hover:animate-navColorFadeDark hover:text-text-color-dark" >
          Sign in!
        </Link>
 
        <Link onClick={() => {hideElement({elementId: "document-overlay-container"}); }} href="/signup?mode=up" prefetch className="border-2 border-gray-600 dark:border-gray-300 px-1 text-[20px] font-[500] rounded-lg dark:hover:animate-navColorFadeLight dark:hover:text-text-color-light hover:animate-navColorFadeDark hover:text-text-color-dark" >
          Sign up!
        </Link>
      </div>

    </div>
  );
};

export default NotSignedInDialog;