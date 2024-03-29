"use client";

import Image from "next/image";
import { changePasswordCall, deleteUserCall } from "@utils/apiCalls";
import { signOut } from "next-auth/react";
import { inputElementValue, showElement, showHideElement } from "@utils/htmlAbstractions";
import { validatePassword } from "@utils/customValidation";
import { useRouter } from "next/navigation";

const GeneralProfileSettings = ({ User, userData, saveUserDataChange, handleUserDataChange } : 
  {
    User: UserSessionData
    userData: WholeUserData
    handleUserDataChange: ({ paramName, value, nestedParamName } : { nestedParamName?: string[], paramName?: string, value: string | number}) => void
    saveUserDataChange: ({ settingName } : { settingName : string }) => Promise<void>
    
  }) => {

  const { push } = useRouter();
  
  const changeUserPassword = async () : Promise<void> => {

    const newPassword = inputElementValue({elementId: "user-password"});

    if( !validatePassword({ password: newPassword }) || !confirm("Are you sure you want to change your password?")){ return; };

    await changePasswordCall({ userId: User.id, password: newPassword });
  };

  const changeUserEmail = async () : Promise<void> => {

    if(!confirm("Are you sure, you want to change your email? This will sign you out and you will need to sign back in.")){ return; };

    await saveUserDataChange({ settingName: "email" });

    push("/auth?mode=in");
  };

  const deleteUserAccount = async () => {

    if(!confirm("Are you sure you want to delete your account? This action can NOT be reverted!")){ return; };

    if(!confirm("Are you sure you want to continue?")){ return; };

    const deleteUserOperation = await deleteUserCall({ userId: User.id });

    if(!deleteUserOperation.acknowledged){
      push(`?app_error=${deleteUserOperation.errors[0]}&e_while=deleting%20user`);
      return;
    };

    signOut({ redirect: false });
    push("/");
  };

  return (
    <section className="flex flex-col items-start pl-10 w-full h-[100dvh] overflow-auto justify-start gap-y-8 pt-10" >

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[120px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 className="text-[22px] font-[600]" >Avatar</h3>

        <p className="text-start text-[16px] font-[400]" >
          Your avatar represents how you want to be seen by others.
          <br />
          Click on it to upload a file from your computer.
        </p>

        <Image
          src={User.image}
          alt={"user-avatar"}
          className="absolute right-6 cursor-not-allowed rounded-full border-gray-600 dark:border-gray-300"
          width={80} height={80}
        />

      </div>

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 className="text-[22px] font-[600]" >Username/Alias</h3>

        <p className="text-start text-[16px] font-[400]" >
          This is the name others see when looking at your profile.
          <br />
          It can be your google account name and/or an alias.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); }} className="relative w-full h-auto flex items-start" >

          <input type="text"
            maxLength={26}
            value={userData?.alias}
            onChange={(e) => { handleUserDataChange({ paramName: "alias", value: e.target.value }); }}
            className="w-full max-w-[340px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button 
            onClick={() => { saveUserDataChange({ settingName: "alias" }); }}
            className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark" 
          >
            Save
          </button>

        </form>
      </div>

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] border-2 border-gray-600 dark:border-gray-300" >
        
        <h3 className="text-[22px] font-[600]" >Description</h3>

        <p className="text-start text-[16px] font-[400]" >
          A quick description of yourself, so that others can get to know you.
        </p>

        <form onSubmit={(e) => { e.preventDefault() }} className="relative w-full h-auto flex items-start" >

          <textarea
            maxLength={256}
            value={userData?.description}
            onChange={(e) => { handleUserDataChange({ paramName: "description", value: e.target.value }); }}
            className="w-full max-w-[400px] min-h-[40px] max-h-[300px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button 
            onClick={() => { saveUserDataChange({ settingName: "description" }); }}
            className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " 
          >
            Save
          </button>

        </form>
      </div>

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        
        <h3 className="text-[22px] font-[600]" >Email</h3>

        <p className="text-start text-[16px] font-[400]" >
          Email used to verify and communicate with you.
          <br />
          Can only be changed if a yows account is registered.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); }} className="relative w-full h-auto flex items-start" >
          
          <input type="text"
            maxLength={26}
            disabled={userData?.provider !== "credentials"}
            value={userData?.email}
            onChange={(e) => { handleUserDataChange({ paramName: "email", value: e.target.value }); }}
            className="w-full max-w-[340px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button 
            disabled={userData?.provider !== "credentials"}  
            onClick={changeUserEmail}
            className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " 
          >
            Save
          </button>
        </form>
      </div>

      <div className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-max min-h-[120px] border-2 border-gray-600 dark:border-gray-300" >
        
        <h3 className="text-[22px] font-[600]" >Password</h3>

        <p className="text-start text-[16px] font-[400]" >
          Your Password.
          <br />
          Can only be changed if a yows account is registered.
        </p>

        {
          userData?.provider !== "credentials" ?
            (
              <button onClick={async (e) => {e.preventDefault(); await signOut({ redirect: false }); push(`/auth?mode=up`); }}
                className=" absolute bottom-2 right-4 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
                Register
              </button>
            )
            :
            (
              <button id="password-setting-toggle" onClick={() => { showHideElement({ elementId: "password-setting-form" }); showHideElement({ elementId: "password-setting-toggle" }); }}
                className=" absolute bottom-2 right-4 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
                  Change password
              </button>
            )


        }

        <form id="password-setting-form" onSubmit={(e) => { e.preventDefault(); }} className="relative hidden w-full h-auto flex flex-col gap-y-2 items-start" >

          <input
            minLength={8}
            maxLength={32}
            id="user-password"
            className="w-full max-w-[400px] max-h-[300px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button 
            onClick={() => { showHideElement({elementId: "password-setting-form"}); showHideElement({elementId: "password-setting-toggle"}); }}
             className=" absolute bottom-0 right-[60px] border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " 
          >
            Cancel
          </button>

          <button onClick={() => { changeUserPassword(); }}
             className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " 
          >
            Save
          </button>

        </form>
      </div>

      <div className="relative bg-red-400 dark:bg-red-500 rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[120px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 className="text-[22px] font-[600]" >Delete account</h3>

        <p className="text-start text-[16px] font-[400]" >
          By deleting your account, all bound data will be lost.
          <br />
          This action can NOT be reverted!
        </p>

        <button 
          onClick={() => { deleteUserAccount(); }}
          className=" absolute bottom-2 right-4 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " 
        >
            Delete account
        </button>

      </div>
    </section>
  );
};

export default GeneralProfileSettings;