
const ErrorComponent = ({errorCodes, errorPath} : {errorCodes : object, errorPath : string}) => {

  const errorTranslator = {
    "AUTH" : "Authorization",
    "DB" : "Database",
  }

  return (
    <>
      <div key={`error-path-div-${errorPath}`} className=" max-w-[1600px] w-full h-auto bg-stone-300 rounded-xl">

        <h1 id={errorPath} className={" text-left bg-stone-400 text-[26px] font-[700] p-4 w-full max-w-[1600px] rounded-ss-xl rounded-se-xl h-auto"} > {errorTranslator[errorPath] + ` (${errorPath})`} </h1>
        <hr className="border-black border-[2px]" />
        
        {
          Object.keys(errorCodes[errorPath]).map((errorType)=>{
            return(
              <div  key={`error-type-div-${errorType}`} className="w-full h-auto  " >
                <hr id={`${errorPath}-${errorType}`} />
                <h2 id={errorType} className="text-[20px] w-full text-left p-5 font-[700] underline" > {errorPath +"-"+errorType} </h2>
                
                
                {
                  Object.keys(errorCodes[errorPath][errorType]).map((errorIndex) => {
                    return(
                      <div id={`${errorPath}-${errorType}-${errorIndex}`} className="w-full h-auto ">
                        <div className="flex flex-row gap-x-2 h-auto w-full items-end justify-start" >
                          <h3 className="w-auto h-auto font-[600] text-[20px] text-left ml-10 p-1">{errorIndex}</h3>
                          {
                            (errorCodes[errorPath][errorType][errorIndex].tags as string[]).map((tag) => {
                              return(
                                <h4 className="w-auto h-auto font-[500] text-[16px] text-left  rounded-lg p-1 border-2 cursor-pointer " key={`error-tag-${tag}`} > {"#" + tag}</h4>
                              )
                            })
                          }
                        </div>
                        <h4 className="text-left ml-10 text-[18px] font-[500]" >Description:</h4>
                        <p className="text-left ml-10">{errorCodes[errorPath][errorType][errorIndex].desc}</p> <br/>
                        <h4 className="text-left ml-10 text-[18px] font-[500]" >Possible fix:</h4>
                        <p className="text-left ml-10">{errorCodes[errorPath][errorType][errorIndex].possibleFix}</p> <br/>
                        
                      </div>
                    )
                  })
                }
                {
                  errorType != Object.keys(errorCodes[errorPath]).at(-1) &&  <hr className="border-1 border-black" />
                    
                }
              </div>
            )
          })
        }
      </div>
    </>
  );
};

export default ErrorComponent;