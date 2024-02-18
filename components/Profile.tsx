import { useEffect, useState } from "react";
import { pullFromDb } from "@utils/api_funcs";
import Image from "next/image";
import ApiOption from "./small_components/ApiOption";
import { useRouter } from "next/navigation";
import { adjustTextareaHeight } from "@utils/generalFunctions";



const Profile = ({ User }) => {

  const defaultUserData : ProfileData = {
    email: "loading...",
    username: "loading...",
    provider: "loading...",
    description: "loading...",
    api_options: {
      data_cleanup: false,
      multithreading: false,
      multiprocessing: false,
      max_scrapes: "loading...",
    },
  }

  const [ userData, setUserData ] = useState(defaultUserData);
  const [ update, setUpdate ] = useState(1);  
  const [ apiOptions, setApiOptions ] = useState(null);

  const { push } = useRouter();

  const getProfileData = async () : Promise<void> => {

    const pullData = {filter : {_id : User.id}, projection: {"__v": 0, "all_saved_scrapes": 0,  "image" : 0}};

    const pull_operation = await pullFromDb({apiKey: "felix12m", dbName: "yows_users", collectionName: "users", data: pullData})

    setApiOptions({
      data_cleanup: pull_operation.found.at(0).api_options.data_cleanup, 
      multithreading: pull_operation.found.at(0).api_options.multithreading, 
      multiprocessing: pull_operation.found.at(0).api_options.multiprocessing
    });

    setUserData(pull_operation.found.at(0));

    return;
  };

  const handleChange = ({paramName, value} : {paramName : string, value : string}) : void => {

    let userDataCopy = userData;

    userDataCopy[paramName] = value;

    if(paramName == "description"){ adjustTextareaHeight({elementId: "description"}); }

    setUserData(userDataCopy);
    setUpdate((prevUpdate) => { return (prevUpdate +1 ) % 2});

    return;
  };

  const saveData = async () : Promise<void> => {

    /**
     * const returnData = await postDataToDb({apiKey: "felix12m", dbName: "yows_users", collectionName: "users", checkDupe: 0, many: 0, returnType: "json", dataToPost: userData});

    console.log("RE:", returnData);
     */

    // need to add new API function to rewrite whole document in Mongo

    return;
  };

  const changeEmailOrPassword = ({settingType}) : void => {

    if(userData.provider === "Google"){

      const confirmation = confirm("You are logged in with google!\nThis means you can not change your account info from here.\nDo you want to be redirected to your google account?");
      if(confirmation){ push("https://myaccount.google.com"); }
    }
    else{

      push("/change-account-settings?type=" + settingType);
    }

    return;
  };

  var profileInitialFetch = true;
  useEffect(() => {

    if(profileInitialFetch){
      getProfileData();
      profileInitialFetch = false;
    }
    adjustTextareaHeight({elementId: "description"});
    adjustTextareaHeight({elementId: "email-text"});

  }, []);

  return (
    <section className="relative mt-5 w-[100%] h-full  p-[4%] gap-x-[1.5%] flex flex-row items-start justify-evenly bg-stone-200 " >

      <div className="w-[45%] flex flex-col items-start h-full gap-y-5 p-5" >
            
        <label className="text-[24px] font-[600] " > Profile-picture:  </label>

        <Image src={User.image} alt="profile pic empty" width={150} height={150} className="rounded-full ml-[calc(50%-75px)] " />

        <label className="text-[24px] font-[600]  " > Username:  </label>

        <input 
          className="w-[80%] text-start rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 "
          value={userData?.username}
          id="username"
          onChange={(e) => { handleChange({paramName: "username", value: e.target.value}); } }  
        />
        
        <label className="text-[24px] font-[600] " > Bio: </label>

        <textarea
          className="w-[calc(100%-20px)] border-2 border-black text-start p-2 rounded-3xl rounded-ss-none rounded-ee-none bg-zinc-200 max-h-[600px] min-h-[60px] "
          value={userData?.description}
          id="description"
          onChange={(e) => { handleChange({paramName: "description", value: e.target.value}); } }
        />

        <label className="text-[24px] font-[600] " > Email: </label>

        <input
          disabled
          className="w-[80%] text-start rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200 opacity-[0.75]"
          value={userData?.email}
          id="email"
          onChange={(e) => { handleChange({paramName: "email", value: e.target.value}); } }
        />

        <div className="w-full h-auto mt-10 gap-x-2 c_row_elm" >
          <button className="border-black border-2 p-1 text-[16px] w-auto bg-purple-400 rounded-lg" onClick={() => {changeEmailOrPassword({settingType: "email"});}} >
            Change email
          </button>
          
          <button className="border-black border-2 p-1 text-[16px] w-auto bg-purple-400 rounded-lg" onClick={() => {changeEmailOrPassword({settingType: "password"});}} >
            Change password
          </button>
        </div>

        <button className=" w-full border-[blueviolet] border-2 rounded-xl bg-stone-300 h-[60px] text-[26px] font-[600] " onClick={(e) => { saveData(); }} > Save changes </button>
        
      </div>

      <div className="h-[90dvh] w-[2px] bg-black" >

      </div>

      <div className="w-[45%] flex flex-col items-start h-full gap-y-5 p-5" >
            
        <label className="text-[24px] font-[600] " > Scrape-options:  </label>

        <div className="c_row_elm w-full h-[120px] gap-x-2 relative" >
          
          {
            apiOptions === null ? 
              (
                <>
                  <div className={"px-1 h-full w-[30%] border-2 border-black rounded-lg bg-gray-200 relative"} > </div>
                  <div className={"px-1 h-full w-[30%] border-2 border-black rounded-lg bg-gray-200 relative"} > </div>
                  <div className={"px-1 h-full w-[30%] border-2 border-black rounded-lg bg-gray-200 relative"} > </div>
                </>
              )
              :
              (
               Object.keys(apiOptions).map((apiOptionKey) => { return ( <ApiOption key={apiOptionKey} apiOptionData={{allowed: Boolean(userData.api_options[apiOptionKey]), type: apiOptionKey}} /> )})
              
              )
          }

        </div>        

        <label className="text-[24px] font-[600]  " > Scraper-storage:  </label>

        <div className="w-full h-[60px] c_row_elm gap-x-2 relative" >

          <span className="rounded-xl border-2 border-black text-[22px] justify-center h-[40px] bg-zinc-200 w-[60px] font-[400]" >
            { userData?.api_options.max_scrapes }
          </span>

          <Image src={"./assets/icons/plus_sign_green.svg"} alt="add scraper storage" width={35} height={35} className="cursor-pointer" />
          <Image src={"./assets/icons/minus_sign_red.svg"} alt="add scraper storage" width={35} height={35} className="cursor-pointer" />

        </div>

        <label className="text-[24px] font-[600] " > API: </label>

        <div className="w-full h-[60px] c_row_elm gap-x-5 relative" >

          {
            userData?.api_interaction?.api_keys == 0 ?
              ( 
                <>
                  <div className="w-auto h-auto flex flex-col items-start pl-1 " >
                    <h2 className="text-[18px] font-[500]  " > You currently don't have an API-key!</h2>
                    <Image src={"./assets/icons/key_green.svg"} alt={"get API-key button"} width={42} height={42} className="cursor-pointer" />
                  </div> 
                </>
                
              )
              :
              (
                <p> Add Plan info</p>
              )
          }
          
          
        </div>
        

        <label className="text-[24px] font-[600] " > Get in touch/Request a feature: </label>

        <input
          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200  text-start w-[50%] "
          placeholder="Your email-address"
          id="comment-email-address-input"
        />

        <input
          className="rounded-xl border-2 border-black text-[16px] pl-2 justify-center h-10 bg-zinc-200  text-start w-[80%]"
          placeholder="Topic"
          id="comment-topic-input"
        />

        <textarea 
          maxLength={512} 
          placeholder="Message"
          id={"email-text"} 
          className="w-full text-start px-1 bg-transparent h-auto border-2 border-black rounded-ss-none rounded-se-xl rounded-ee-none rounded-es-xl"
          onChange={(e) => { adjustTextareaHeight({elementId: "email-text"}); }} 
        />


        <button className="purple_btn " >
          Send
        </button>
        
      </div>

    </section>
  );
};

export default Profile;