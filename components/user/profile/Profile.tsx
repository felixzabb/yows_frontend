import { useEffect, useState, useContext } from "react";
import { pullFromDb, putToDb } from "@utils/api_funcs";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileData } from "@custom-types";
import GeneralProfileSettings from "./GeneralProfileSettings";
import SubscriptionProfileSettings from "./SubscriptionProfileSettings";
import ApiProfileSettings from "./ApiProfileSettings";
import { showHideElement } from "@utils/generalFunctions";
import { ScaleLoader } from "react-spinners";

const Profile = ({ User, AuthStatus }) => {

  const urlQueryParams = useSearchParams();

  const [ userData, setUserData ] = useState<ProfileData | null>(null); 

  const [ update, setUpdate ] = useState(1); 

  const { push } = useRouter();

  const rerenderPage = () : void => {
    setUpdate((prevUpdate) => { return (prevUpdate +1) % 2; });
    return;
  };

  const goToProfileSection = ({sectionType} : {sectionType : string}) => {

    push(`?section=${sectionType}`)
  };

  const getProfileData = async () : Promise<void> => {

    const pullData = {filter : {_id : User.id}, projection: {"__v": 0, "all_saved_scrapes": 0,  "image" : 0}};

    const pull_operation = await pullFromDb({apiKey: "felix12m", dbName: "yows_users", collectionName: "users", data: pullData})

    setUserData(pull_operation.found.at(0));
    console.log(pull_operation.found.at(0));
    rerenderPage();
    return;
  };

  const saveSpecificChange = async ({setting, newValue, nested, nestedPath} : {setting : string, newValue : string, nested? : boolean, nestedPath? : string[]}) => {

    let setObject = {};
    setObject[setting] = newValue;

    await putToDb({apiKey: "felix12m" , dbName: "yows_users", collectionName: "users", data: {filter: {_id: User.id}, update: {"$set" : setObject}}});

    //positive change revalidation on reload
    setUserData((prevUserData) => {
      if(nested !== undefined && nested){
        prevUserData[nestedPath.at(0)][nestedPath.at(1)] = newValue;
      }
      else{
        prevUserData[setting] = newValue;
      }
      return prevUserData;
    });
    rerenderPage();
    return;
  };

  const addBgClue = ({elementId} : {elementId : string}) => {
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

    if(urlQueryParams.get("section") === null){ push("?section=general"); };

    if(profileInitialFetch){
      getProfileData();
      profileInitialFetch = false;
    };

  }, []);

  useEffect(() => {
    addBgClue({elementId : `profile-sideNav-${urlQueryParams.get("section")}`});
  }, [urlQueryParams])

  return (
    <div id="profile-container" className="relative flex flex-row flex-grow items-start justify-start w-full min-h-[100dvh] max-h-[100dvh]" >

      <section id="profile-sideNav" className="flex flex-col gap-y-4 items-start min-w-[350px] max-w-[350px] h-full overflow-auto bg-wsform-sideNav-light-bg dark:bg-wsform-sideNav-dark-bg p-4 " >
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

      </section>

      <hr id="profile-sideNav-separator" className="w-[2px] h-[100dvh] bg-gray-400 " /> 

      {
        Array.from(urlQueryParams.keys()).map((key) => {

          const value = urlQueryParams.get(key)

          if(userData === null){
            return(
              <ScaleLoader key={key} height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" className="absolute right-[calc(calc(100%-324px)*0.5)] top-5" />
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