"use client"
import ErrorComponent from "@components/ErrorComponent";
import errorCodes from "@utils/errorCodes.json";
import { useRouter } from "next/navigation";
import { returnInputElementValue } from "@utils/generalFunctions";

const ErrorPage = () => {
  const {push} = useRouter();
  return (
    <>
      <aside className="w-full max-w-[1600px] h-[200px] flex flex-row items-start justify-start gap-x-5 border-2 border-black shadow-sm rounded-xl bg-stone-300 p-4">
        <form onSubmit={(e) => {e.preventDefault()}} className="flex- flex-col gap-y-2 items-start justify-start text-start" >
          <label className="text-[20px] font-[600] ml-[1px]" >Search:</label> 
          <div className="flex flex-row w-full h-auto items-center gap-x-2 " >
            <input
              className="w-full h-[40px] rounded-lg border-2 border-black px-2 text-start bg-slate-200 "
              type="text"
              id={"errors-search-input"}
            />
            <button className="rounded-lg bg-purple-400 text-[18px] font-[600] p-2" onClick={() => { push(`/errors#${returnInputElementValue({elementId: "errors-search-input"}).toUpperCase()}`); }}> Search</button>
          </div>
        </form >
        
      </aside>
      <section className="w-full h-full flex flex-col items-center gap-y-12 mt-10" >

        {
          Object.keys(errorCodes).map((errorPath) => {
            return(
             <ErrorComponent errorCodes={errorCodes} errorPath={errorPath} key={`error-component-${errorPath}`} />
            )
          })
        }
        
      </section>
    </>
  );
};

export default ErrorPage;