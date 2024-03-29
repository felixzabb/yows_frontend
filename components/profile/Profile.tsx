import { useEffect, useState, useContext } from "react";
import { pullFromDbCall, putToDbCall } from "@utils/apiCalls";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import GeneralProfileSettings from "./GeneralProfileSettings";
import SubscriptionProfileSettings from "./SubscriptionProfileSettings";
import ApiProfileSettings from "./ApiProfileSettings";
import { ScaleLoader } from "react-spinners";
import { showHideElement } from "@utils/htmlAbstractions";
import { removeQueryParamsByKey, showOverlay } from "@utils/generalUtils";
import NotSignedInDialogue from "@components/dialogues/NotSignedInDialogue";
import { signOut } from "next-auth/react";
import { overlayContext } from "@components/layout/Provider";

const Profile = ({ User, authStatus } : { User: UserSessionData, authStatus: "authenticated" | "unauthenticated" }) => {

  const overlayContextAccess = useContext<OverlayContextValue>(overlayContext);

  const { push } = useRouter();
  const urlQueryParams = useSearchParams();
  const currentSection = urlQueryParams.get("section");

  const [ userDataReference, setUserDataReference ] = useState<WholeUserData | null>(null);
  const [ userData, setUserData ] = useState<WholeUserData | null>(null);

  const goToProfileSection = ({ sectionType } : { sectionType : string }) : void => {
    push(`?section=${sectionType}`);
  };

  const getProfileData = async () : Promise<void> => {

    const pullData = { filter : { _id : User.id }, projection: { "__v": 0, "saved_scrapers": 0 } };
    const pullOperation = await pullFromDbCall<WholeUserData>({ dbName: "yows_users", collectionName: "users", data: pullData });

    if(!pullOperation.acknowledged){
      push(`?app_error=${pullOperation.errors[0]}&e_while=loading%20profile`);
      return;
    };

    setUserDataReference(pullOperation.found.at(0));
    setUserData(pullOperation.found.at(0));
  };

  const saveUserDataChange = async ({ settingName, nestedSettingName } : { settingName : string, nestedSettingName?: string[] }) : Promise<void> => {

    let settingValue : string | number ;

    if(nestedSettingName){
      settingValue = userData[nestedSettingName[0]][nestedSettingName[1]];

      // Don't send a request if the data hasn't changed. If it has update the reference.
      if(settingValue === userDataReference[nestedSettingName[0]][nestedSettingName[1]]){
        return;
      };

      setUserDataReference((prevUserDataReference) => ({
        ...prevUserDataReference,
        [nestedSettingName[0]]: {
          ...prevUserDataReference[nestedSettingName[0]],
          [nestedSettingName[1]]: settingValue,
        }
      }));
    }
    else if(!nestedSettingName){
      settingValue = userData[settingName];

      // Don't send a request if the data hasn't changed. If it has update the reference.
      if(settingValue === userDataReference[settingName]){
        return;
      };

      setUserDataReference((prevUserDataReference) => ({
        ...prevUserDataReference,
        [settingName]: settingValue
      }));
    }

    const putData = { filter: { _id: User.id }, update: { "$set" : { [settingName] : settingValue } }};

    const saveOperation = await putToDbCall({ dbName: "yows_users", collectionName: "users", data: putData });

    if(!saveOperation.acknowledged){
      push(`?app_error=${saveOperation.errors[0]}&e_while=saving%20change(s)`);
      return;
    };

    // This is a 'positive' update. Revalidation happens on page load.
    handleUserDataChange({ paramName: settingName, nestedParamName: nestedSettingName, value: settingValue});
  };

  const addSectionClue = ({ elementId } : { elementId : string }) : void => {

    const possibleClasses = ["dark:bg-zinc-800", "bg-gray-300"];

    for(const profileSectionName of ["general", "subscription", "api"]){

      const element = window.document.getElementById(`goto-${profileSectionName}`);

      element.classList.remove(possibleClasses[0]);
      element.classList.remove(possibleClasses[1]);
    };

    window.document.getElementById(elementId).classList.add(possibleClasses[0]);
    window.document.getElementById(elementId).classList.add(possibleClasses[1]);
  };

  const handleUserDataChange = ({ paramName, value, nestedParamName } : { nestedParamName?: string[], paramName?: string, value: string | number}) : void => {

    if(paramName){
      setUserData((prevUserData) => ({
        ...prevUserData,
        [paramName]: value
      }));
    }
    else if(nestedParamName){
      setUserData((prevUserData) => ({
        ...prevUserData,
        [nestedParamName[0]]: {
          ...prevUserData[nestedParamName[0]],
          [nestedParamName[1]]: value
        }
      }));
    };
  };

  // Check if user is authenticated. If yes, get the profile data and set it.
  useEffect(() => {

    if(authStatus === "unauthenticated"){
      showOverlay({
        context: overlayContextAccess, 
        element: <NotSignedInDialogue message="You can't access/have a profile. Please create an account or sign in!" />, 
        title: "Not signed in!"
      });
    }
    else if(authStatus === "authenticated"){
      getProfileData();
    };

  }, []);

  // Highlight the sideNav button of the current profile section.
  useEffect(() => {

    if(!["api", "general", "subscription"].includes(urlQueryParams.get("section"))){
      push(`?${removeQueryParamsByKey({ queryParams: urlQueryParams, keys: ["section"] })}section=general`);
    }
    else{
      addSectionClue({elementId : `goto-${urlQueryParams.get("section")}`}); 
    };
  }, [urlQueryParams])

  return (
    <section className="relative flex flex-row flex-grow items-start justify-start w-full min-h-[100dvh] max-h-[100dvh]" >

      <aside id="profile-sideNav" className="flex flex-col gap-y-4 items-start min-w-[350px] max-w-[350px] h-[100dvh] overflow-auto bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg p-4 border-r-2 border-gray-400" >
        
        <h2 className="font-inter font-[500] h-auto w-auto text-[20px] mb-4" >Account settings</h2>

        <button id="goto-general" onClick={() => {goToProfileSection({sectionType: "general"})}}
          className=" text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg " >
          General
        </button>

        <button id="goto-subscription" onClick={() => {goToProfileSection({sectionType: "subscription"})}}
          className="text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg " >
          Subscription
        </button>

        <button id="goto-api" onClick={() => { goToProfileSection({sectionType: "api"})}}
          className="text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg" >
          Api
        </button>

        <button onClick={() => { if(confirm("Are your sure, you want to sign out?")){ signOut({ redirect: false }); push("/"); }; }}
          className="text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg bg-red-600 opacity-80" >
          Sign out
        </button>

      </aside>

      {
        !urlQueryParams || !currentSection || !userData && (
          <ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" className="absolute right-[calc(100%*0.5)] top-5" />
        )
      }

      {
        userData && currentSection === "general" && (
          <GeneralProfileSettings User={User} userData={userData} handleUserDataChange={handleUserDataChange} saveUserDataChange={saveUserDataChange} />
        )
      }

      {
        userData && currentSection === "subscription" && (
          <SubscriptionProfileSettings userData={userData} />
        )
      }
      
      {
        userData && currentSection === "api" && (
          <ApiProfileSettings User={User} userData={userData} handleUserDataChange={handleUserDataChange} />
        )
      }

      <Image
        src={"/assets/icons/generic/menu.svg"}
        alt={"Toggle sideNav"}
        width={44} height={44}
        className="fixed bottom-6 left-8 cursor-pointer rounded-lg p-1 bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg"
        onClick={() => { showHideElement({elementId: "profile-sideNav"}); }}
      />

    </section>
  );
};

export default Profile;