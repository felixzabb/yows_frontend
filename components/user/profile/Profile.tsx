import { useEffect, useState, useContext } from "react";
import { pullFromDb, putToDb } from "@utils/api_funcs";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomAppContext, UserProfileData } from "@custom-types";
import GeneralProfileSettings from "./GeneralProfileSettings";
import SubscriptionProfileSettings from "./SubscriptionProfileSettings";
import ApiProfileSettings from "./ApiProfileSettings";
import { ScaleLoader } from "react-spinners";
import { showHideElement } from "@utils/elementFunction";
import { showOverlay } from "@utils/generalFunctions";
import { appContext } from "@components/layout/Provider";
import NotSignedInDialog from "@components/dialogues/NotSignedInDialog";
import { signOut } from "next-auth/react";

const Profile = ({ User, AuthStatus }) => {

  const urlQueryParams = useSearchParams();
  const context = useContext<CustomAppContext>(appContext);
  const { push } = useRouter();

  const [ userData, setUserData ] = useState<UserProfileData | null>(null); 

  const goToProfileSection = ({sectionType} : {sectionType : string}) => {
    push(`?section=${sectionType}`);
  };

  const getProfileData = async () : Promise<void> => {

    const pullData = {filter : {_id : User.id}, projection: {"__v": 0, "saved_scrapers": 0}};
    const pullOperation = await pullFromDb<UserProfileData>({apiKey: "felix12m", dbName: "yows_users", collectionName: "users", data: pullData});

    if(!pullOperation.acknowledged){
      push(`?app_error=${pullOperation.errors[0]}&e_while=loading%20profile`);
      return;
    };

    setUserData(pullOperation.found.at(0));
    return;
  };

  const saveSpecificChange = async ({setting, newValue} : {setting : string, newValue : string}) => {

    if(userData?.[setting] === newValue){ return; };
    const setObject = {[setting] : newValue};

    const saveOperation = await putToDb({apiKey: "felix12m" , dbName: "yows_users", collectionName: "users", data: {filter: {_id: User.id}, update: {"$set" : setObject}}});

    if(!saveOperation.acknowledged){
      push(`?app_error=${saveOperation.errors[0]}&e_while=saving%20change(s)`);
      return;
    };

    //positive change revalidation on reload
    setUserData((prevUserData) => ({
      ...prevUserData,
      [setting]: newValue,
    }));
    return;
  };

  const addSectionClue = ({elementId} : {elementId : string}) => {
    const possibleClasses = ["dark:bg-zinc-800", "bg-gray-300",];
    for(const i of ["general", "subscription", "api"]){
      const element = window.document.getElementById(`profile-sideNav-${i}`);
      element.classList.remove(possibleClasses[0]);
      element.classList.remove(possibleClasses[1]);
    }
    window.document.getElementById(elementId).classList.add(possibleClasses[0]);
    window.document.getElementById(elementId).classList.add(possibleClasses[1]);

    return;
  };

  var profileInitialFetch = true;
  useEffect(() => {
    if(window.visualViewport.width < 1100){ window.document.getElementById("profile-sideNav").classList.add("hidden"); };

    if(AuthStatus === "unauthenticated"){
      console.log("here")
      showOverlay({context: context, element: <NotSignedInDialog message="You can't access/have a profile. Please create an account or sign in!" />, title: "Not signed in!"});
      return;
    };

    if(AuthStatus === "authenticated" && profileInitialFetch){
      getProfileData();
      profileInitialFetch = false;
    };

  }, []);

  useEffect(() => {

    if(!urlQueryParams.has("section")){ 
      if(urlQueryParams.size === 0){ push("?section=general"); }
      else{ push(`?${urlQueryParams}&section=general`); };
    }
    else{
      if(!["api", "general", "subscription"].includes(urlQueryParams.get("section"))){
        push("?section=general");
      }
      else{
        addSectionClue({elementId : `profile-sideNav-${urlQueryParams.get("section")}`}); 
      }
    }
    
  }, [urlQueryParams])

  return (
    <div id="profile-container" className="relative flex flex-row flex-grow items-start justify-start w-full min-h-[100dvh] max-h-[100dvh]" >

      <section id="profile-sideNav" className="flex flex-col gap-y-4 items-start min-w-[350px] max-w-[350px] h-[100dvh] overflow-auto bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg p-4 " >
        <h2 id="profile-sideNav-heading" className="font-inter font-[500] h-auto w-auto text-[20px] mb-4" >Account settings</h2>

        <button id="profile-sideNav-general" onClick={() => {goToProfileSection({sectionType: "general"})}}
          className=" text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg " >
          General
        </button>

        <button id="profile-sideNav-subscription" onClick={() => {goToProfileSection({sectionType: "subscription"})}}
          className="text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg " >
          Subscription
        </button>

        <button id="profile-sideNav-api" onClick={() => { goToProfileSection({sectionType: "api"})}}
          className="text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg" >
          Api
        </button>

        <button id="profile-sideNav-api" onClick={() => {const confirmation = confirm("Are your sure, you want to sign out?"); if(confirmation){signOut({redirect: false}); push("/");}; }}
          className="text-[20px] w-full font-[Helvetica] font-[500] p-1 text-start pl-2 border-gray-600 border-[1px] dark:border-gray-300 rounded-lg bg-red-600 opacity-80" >
          Sign out
        </button>

      </section>

      <hr id="profile-sideNav-separator" className="w-[2px] h-[100dvh] bg-gray-400 " /> 

      {
        AuthStatus === "authenticated" && Array.from(urlQueryParams.keys()).map((key) => {

          const value = urlQueryParams.get(key)

          if(userData === null){
            return(
              <ScaleLoader key={key} height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" className="absolute right-[calc(100%*0.5)] top-5" />
            );
          };

          if(value === "general"){
            return (
              <GeneralProfileSettings key={value} User={User} userData={userData} save={saveSpecificChange} push={push} />
            );
          }
          else if(value === "subscription"){
            return(
              <SubscriptionProfileSettings key={value} userData={userData} push={push} />
            );
          }
          else if(value === "api"){
            return(
              <ApiProfileSettings key={value} User={User} userData={userData} save={saveSpecificChange} push={push} setUserData={setUserData} />
            );
          }
        })
      }

      <Image
        src={"/assets/icons/generic/menu.svg"}
        id="toggle-profile-sideNav"
        alt={"Toggle sideNav"}
        width={44}
        height={44}
        className="fixed bottom-6 left-8 cursor-pointer rounded-lg p-1 bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg"
        onClick={() => {showHideElement({elementId: "profile-sideNav"}); showHideElement({elementId: "profile-sideNav-separator"}); }}
      />
    </div>
  );
};

export default Profile;