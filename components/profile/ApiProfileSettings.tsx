"use client";

import { generateApiKeyCall, putToDbCall } from "@utils/apiCalls";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ApiProfileSettings = ({ User, userData, handleUserDataChange } : 
  {
    User: UserSessionData
    userData: WholeUserData
    handleUserDataChange: ({ paramName, value, nestedParamName } : { nestedParamName?: string[], paramName?: string, value: string | number | []}) => void
  }) => {

  const { push } = useRouter();

  const generateNewApiKey = async () => {

    const createKeyOperation = await generateApiKeyCall({ userId: User.id });

    if(!createKeyOperation.acknowledged){
      push(`?app_error=${createKeyOperation.errors[0]}&e_while=creating%20an%20API%20key`);
      return;
    };

    handleUserDataChange({ nestedParamName: ["api", "api_keys"], value: createKeyOperation.created_key });
  };

  const deleteApiKey = async ({ key } : { key : string }) => {
    
    const putData = { filter: { _id : User.id }, update: { "$pop" : { "api.api_keys" : 1 } } };
    const deleteOperation = await putToDbCall({ dbName: "yows_users", collectionName: "users", data: putData });

    if(!deleteOperation.acknowledged){
      push(`app_error=${deleteOperation.errors[0]}&e_while=deleting%20API%20key`);
      return;
    };

    handleUserDataChange({ nestedParamName: ["api", "api_keys"], value: [] });
  };
  
  return (
    <section className="flex flex-col items-start pl-10 w-full h-[98%] overflow-auto justify-start gap-y-8 pt-10" >

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        
        <h3 className="text-[22px] font-[600]" >API-key</h3>

        <p className="text-start text-[16px] font-[400]" >
          To interact with the API you need an API-key.
          <br />
          You can have only have 1 key!
        </p>

        <div className="relative w-full h-auto flex items-start" >

          <div className="flex flex-col lg:flex-row h-min items-start gap-y-2 gap-x-2 w-full min-h-[40px]" >

            {
              userData.api.api_keys.length === 0 && (
                <span className="text-[18px] font-[600]" >You have no API-keys!</span>
              )
            }
            
            {
              userData.api.api_keys.length > 0 && userData.api.api_keys.map((key : string) => {

                return(
                  <div key={key} className="flex flex-row items-center gap-x-2 " >

                    <Image
                      src={"/assets/icons/generic/copy.svg"}
                      alt={"copy api-key"}
                      className=" mb-[-5px]"
                      onClick={() => { navigator.clipboard.writeText(key); }}
                      width={30} height={30}
                    />

                    <span className="text-[18px] font-[600]" >{`key-${userData.api.api_keys.indexOf(key)}`}</span>

                    <Image
                      src={"/assets/icons/generic/minus_sign_black.svg"}
                      alt={"delete api-key"}
                      className=" rounded-lg bg-red-500 p-[2px] mb-[-5px]"
                      width={20} height={20}
                      onClick={async () => {await deleteApiKey({ key: key }); } }
                    />

                    <hr className="h-[36px] mb-[-5px] w-[1px] bg-black dark:bg-white opacity-20 " />

                  </div>
                );
              })
            }
          </div>
          
          {
            userData.api.api_keys.length < 1 &&
              (
                <button 
                  disabled={userData.api.api_keys.length >= 1} 
                  onClick={() => { generateNewApiKey(); }}
                  className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " 
                >
                  Add key
                </button>
              )
          }
          
        </div>
      </div>

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        
        <h3 className="text-[22px] font-[600]" >Rate limit</h3>

        <p className="text-start text-[16px] font-[400]" >
          You can only send so many requests per day, this is your rate limit.
          <br />
          To see how much it costs please visit <Link rel="noopener noreferrer" target="_blank" href="/pricing?product=rate_limit" > <span className="underline font-[600]" >Pricing.</span> </Link>
        </p>

        <div className="relative w-full h-auto flex items-start min-h-[34px]" >

          <span className="text-[18px] font-[600]" >{`Current: ${userData.api.rate_limit}`}</span>

          <Link href={"/pricing?product=rate_limit"} rel="noopener noreferrer" target="_blank" className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Increase limit
          </Link>
        </div>
      </div>

    </section>
  );
};

export default ApiProfileSettings;