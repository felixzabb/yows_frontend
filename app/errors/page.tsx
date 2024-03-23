"use client"
import ErrorComponent from "@components/docs/ErrorComponent";
import { inputElementValue } from "@utils/elementFunction";
import errorCodes from "@utils/errorCodes.json";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ErrorPage = () => {
  const { push } = useRouter();

  return (
    <section id="error-page" className="w-[100dvw] flex flex-col items-center h-auto mb-[60px]" >
      <aside className=" mt-5 w-[80%] max-w-[1600px] h-auto flex flex-row items-start justify-start gap-x-5 border-2 border-gray-600 dark:border-gray-300 bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg shadow-sm rounded-xl p-4">
        <form onSubmit={(e) => { e.preventDefault(); push(`/errors#${inputElementValue({elementId: "errors-search-input"}).toUpperCase()}`); }} className="flex- flex-col gap-y-2 items-start justify-start text-start" >
          <label className="text-[20px] font-[600] ml-[1px]" >Search:</label> 
          <div className="flex flex-row w-full h-auto items-center gap-x-2 " >
            <input
              className="w-full h-[40px] rounded-lg border-2 border-gray-400 px-2 text-start bg-header-light-bg dark:bg-header-dark-bg "
              type="text"
              id={"errors-search-input"}
            />
            <Image
              id="error-search"
              alt="search"
              src="/assets/icons/generic/search.svg"
              className="cursor-pointer"
              height={40}
              width={40}
              onClick={() => { push(`/errors#${inputElementValue({elementId: "errors-search-input"}).toUpperCase()}`); }}
            />
          </div>
        </form >
        
      </aside>
      <div className="w-full h-full flex flex-col items-center gap-y-12 mt-10" >

        {
          Object.keys(errorCodes).map((errorPath) => {
            return(
             <ErrorComponent errorCodes={errorCodes} errorPath={errorPath} key={`error-component-${errorPath}`} />
            )
          })
        }
        
      </div>

      <Image
        src="/assets/icons/generic/scroll_top.svg"
        alt="scroll to top"
        id="error-scroll-top"
        width={40}
        height={40}
        className="cursor-pointer fixed bottom-6 left-8"
        onClick={() => { push("#"); }}
      />
    </section>
  );
};

export default ErrorPage;