
const ErrorDoc = ({ errorCodes, errorPath } : { errorCodes : object, errorPath : string }) => {

  const errorTranslator = {
    AUTH : "Authorization",
    DB : "Database",
    SCRAPE: "Scraping",
    SERVER: "Server",
    UNKNOWN: "Unknown",
  };

  return (
    <section className=" max-w-[1600px] w-[80%] h-auto bg-header-light-bg dark:bg-header-dark-bg rounded-xl shadow-[0px_0px_10px_#000000] dark:shadow-[0px_0px_8px_#BBBBBB]">
      
      <aside className="w-full h-auto bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg rounded-ss-xl rounded-se-xl" >

        <h1 id={errorPath} className={" text-left text-[22px] font-[600] p-4 w-full max-w-[1600px] h-auto"} > 
          {errorTranslator[errorPath] + ` (${errorPath})`} 
        </h1>

      </aside>
      
      {
        Object.keys(errorCodes[errorPath]).map((errorType)=>(

          <div  key={`${errorType}`} className="w-full h-auto " >

            <hr id={`${errorPath}-${errorType}`} className="h-[2px] dark:h-[1px] w-full bg-gray-900 dark:bg-gray-300" />

            <h2 id={errorType} className="text-[18px] w-full text-left pl-5 py-4 font-[500] underline" > {errorPath +"-"+errorType} </h2>
              
            {
              Object.keys(errorCodes[errorPath][errorType]).map((errorIndex) => (
                
                  <div key={errorIndex} id={`${errorPath}-${errorType}-${errorIndex}`} className="w-full h-auto ">

                    <div className="flex flex-row gap-x-2 h-auto w-full items-end justify-start pb-2" >

                      <h3 className="w-auto h-auto font-[700] text-[20px] text-left ml-10 p-1">{errorIndex}</h3>

                      {
                        (errorCodes[errorPath][errorType][errorIndex].tags as string[]).map((tag) => (
                            <h4 key={`error-tag-${tag}`} className="w-auto h-auto font-[500] text-[14px] text-left rounded-lg p-1 border-[1px] border-gray-600 dark:border-gray-300" > {"#" + tag}</h4>
                          )
                        )
                      }

                    </div>

                    <div className="flex flex-col items-start pb-3" >

                      <h4 className="text-left ml-10 text-[18px] font-[500]" >Description:</h4>
                      <p className="text-left ml-10 mb-2">{errorCodes[errorPath][errorType][errorIndex].desc}</p>
                      
                      <h4 className="text-left ml-10 text-[18px] font-[500]" >Possible fix:</h4>
                      <p className="text-left ml-10">{errorCodes[errorPath][errorType][errorIndex].possibleFix}</p>

                    </div>
                    
                  </div>
                )
              )
            }

            {
              errorType !== Object.keys(errorCodes[errorPath]).at(-1) &&  <hr className="border-1 border-black" />
            }
          </div>
          )
        )
      }
      
    </section>
  );
};

export default ErrorDoc;