import Link from "next/link";

const NotSignedInDialogue = ( {message } : { message : string }) => {

  return (
    <div className="flex flex-col items-center gap-y-2" >
      
      <h2 className="text-[20px] font-[500] font-inter w-full text-center" >
        You are not signed in!
      </h2>

      <p className="text-[18px] font-[400] w-full text-center" >
        {message}
      </p>

      <div className="flex flex-row items-center justify-between w-[80%] h-[50px]" > 
        
        <Link href="/auth?mode=in" className="border-2 border-gray-600 dark:border-gray-300 px-1 text-[20px] font-[500] rounded-lg dark:hover:animate-navColorFadeLight dark:hover:text-text-color-light hover:animate-navColorFadeDark hover:text-text-color-dark" >
          Sign in!
        </Link>
 
        <Link href="/auth?mode=up" className="border-2 border-gray-600 dark:border-gray-300 px-1 text-[20px] font-[500] rounded-lg dark:hover:animate-navColorFadeLight dark:hover:text-text-color-light hover:animate-navColorFadeDark hover:text-text-color-dark" >
          Sign up!
        </Link>

      </div>
    </div>
  );
};

export default NotSignedInDialogue;