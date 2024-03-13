"use client";

import Image from "next/image";
import { changePassword, deleteUser } from "@utils/api_funcs";
import { signOut } from "next-auth/react";
import { inputElementValue, showElement, showHideElement } from "@utils/elementFunction";
import { validatePassword } from "@utils/validation";

const GeneralProfileSettings = ({User, userData, save, push}) => {

  const handlePasswordChange = async () => {

    const confirmation = confirm("Are you sure you want to change your password?");

    if(!confirmation){ return; };

    const newPassword = inputElementValue({elementId: "user-password"})

    if(!validatePassword({password: newPassword})){
      window.document.getElementById("user-password-error").textContent = "Password needs to be at least 8 character long and include 1 uppercase, 1 lowercase and 1 special character."
      showElement({elementId: "user-password-error"});
      return;
    }

    await changePassword({apiKey: "felix12m", userId: User.id, password: newPassword});

    return;
  };

  const deleteAccount = async () => {
    const confirmation1 = confirm("Are you sure you want to delete your account? This action can NOT be reverted!");

    if(!confirmation1){ return; };

    const confirmation2 = confirm("Are you sure you want to continue?");

    if(!confirmation2){ return; };

    const deleteUserOperation = await deleteUser({apiKey: "felix12m", userId: User.id});

    if(!deleteUserOperation.acknowledged){
      push(`?app_error=${deleteUserOperation.errors[0]}&e_while=deleting%20user`);
      return;
    }

    signOut({redirect: false});
    push("/");
    return;
  };

  return (
    <section id="general-settings-container" className="flex flex-col items-start pl-10 w-full h-[100dvh] overflow-auto justify-start gap-y-8 pt-10" >

      <div id="avatar-setting-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[120px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="avatar-setting-heading" className="text-[22px] font-[600]" >Avatar</h3>

        <p id="avatar-setting-description" className="text-start text-[16px] font-[400]" >
          Your avatar represents how you want to be seen by others.
          <br />
          Click on it to upload a file from your computer.
        </p>

        <Image
          src={User.image}
          alt={"user-avatar"}
          className="absolute right-6 cursor-not-allowed rounded-full border-gray-600 dark:border-gray-300"
          width={80}
          height={80}
        />

      </div>

      <div id="username-setting-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="username-setting-heading" className="text-[22px] font-[600]" >Username/Alias</h3>

        <p id="username-setting-description" className="text-start text-[16px] font-[400]" >
          This is the name others see when looking at your profile.
          <br />
          It can be your google account name and/or an alias.
        </p>

        <form id="username-setting-form" onSubmit={(e) => {e.preventDefault()}} className="relative w-full h-auto flex items-start" >
          <input
            type="text"
            maxLength={26}
            id="user-username"
            defaultValue={userData?.alias === "" ? (User?.name) : (userData?.alias)}
            className="w-full max-w-[340px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button id="username-setting-save" onClick={() => { save({setting: "alias", newValue: inputElementValue({elementId: "user-username"})}); }}
             className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Save
          </button>
        </form>
      </div>

      <div id="description-setting-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="description-setting-heading" className="text-[22px] font-[600]" >Description</h3>

        <p id="description-setting-description" className="text-start text-[16px] font-[400]" >
          A quick description of yourself, so that others can get to know you.
        </p>

        <form id="description-setting-form" onSubmit={(e) => {e.preventDefault()}} className="relative w-full h-auto flex items-start" >
          <textarea
            maxLength={256}
            id="user-description"
            defaultValue={userData.description}
            className="w-full max-w-[400px] max-h-[300px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button id="description-setting-save" onClick={() => { save({setting: "description", newValue: inputElementValue({elementId: "user-description"})}); }}
             className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Save
          </button>
        </form>
      </div>

      <div id="email-setting-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[160px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="email-setting-heading" className="text-[22px] font-[600]" >Email</h3>

        <p id="email-setting-description" className="text-start text-[16px] font-[400]" >
          Email used to verify and communicate with you.
          <br />
          Can only be changed if a yows account is registered.
        </p>

        <form id="email-setting-form" onSubmit={(e) => {e.preventDefault()}} className="relative w-full h-auto flex items-start" >
          <input
            type="text"
            maxLength={26}
            id="user-email"
            disabled={userData?.provider !== "credentials"}
            defaultValue={userData?.email === undefined ? (User.email) : (userData?.email)}
            className="w-full max-w-[340px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <button disabled={userData?.provider !== "credentials"} id="email-setting-save"  onClick={() => { save({setting: "alias", newValue: inputElementValue({elementId: "user-email"})}); }}
             className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Save
          </button>
        </form>
      </div>

      <div id="password-setting-wrapper" className="relative bg-header-light-bg dark:bg-header-dark-bg rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[200px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="password-setting-heading" className="text-[22px] font-[600]" >Password</h3>

        <p id="password-setting-description" className="text-start text-[16px] font-[400]" >
          Your Password.
          <br />
          Can only be changed if a yows account is registered.
        </p>

        {
          userData?.provider !== "credentials" ?
            (
              <button id="create-yows-account" onClick={() => { push(`${process.env.NEXT_PUBLIC_YOWS_FRONTEND_HOST_URL}/signup`); }}
                className=" absolute bottom-2 right-4 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
                Register
              </button>
            )
            :
            (
              <button  id="password-setting-toggle" onClick={() => { showHideElement({elementId: "password-setting-form"}); showHideElement({elementId: "password-setting-toggle"}); }}
                className=" absolute bottom-2 right-4 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
                  Change password
              </button>
            )


        }

        <form id="password-setting-form" onSubmit={(e) => {e.preventDefault()}} className="relative hidden w-full h-auto flex flex-col gap-y-2 items-start" >
          <input
            minLength={8}
            maxLength={32}
            id="user-password"
            className="w-full max-w-[400px] max-h-[300px] p-1 text-start text-[16px] dark:bg-wsform-sideNav-dark-bg bg-wsform-sideNav-light-bg border-black dark:border-gray-200 border-[1px] rounded-md "
          />

          <h3 id="user-password-error" className="hidden text-red-500 text-[14px] font-[500] w-[70%]" >
            
          </h3>

          <button id="password-setting-save" onClick={() => { showHideElement({elementId: "password-setting-form"}); showHideElement({elementId: "password-setting-toggle"}); }}
             className=" absolute bottom-0 right-[60px] border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Cancel
          </button>

          <button id="password-setting-save" onClick={() => { handlePasswordChange(); }}
             className=" absolute bottom-0 right-0 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Save
          </button>
        </form>
      </div>

      <div id="delete-account-setting-wrapper" className="relative bg-red-400 dark:bg-red-500 rounded-lg p-4 flex flex-col items-start justify-center gap-y-2 w-[90%] max-w-[800px] h-auto min-h-[120px] border-2 border-gray-600 dark:border-gray-300" >
        <h3 id="delete-account-setting-heading" className="text-[22px] font-[600]" >Delete account</h3>

        <p id="delete-account-setting-description" className="text-start text-[16px] font-[400]" >
          By deleting your account, all bound data will be lost.
          <br />
          This action can NOT be reverted!
        </p>

        <button  id="delete-account" onClick={() => { deleteAccount(); }}
          className=" absolute bottom-2 right-4 border-[1px] font-[600] border-black dark:border-gray-200 rounded-lg p-1 px-2 hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark  " >
            Delete account
        </button>

      </div>
    </section>
  );
};

export default GeneralProfileSettings;