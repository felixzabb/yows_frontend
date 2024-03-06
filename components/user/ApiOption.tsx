"use client";

import { useState } from "react";
import Image from "next/image";

const ApiOption = ({ apiOptionData }) => {

  const [ apiNames, setApiNames ] = useState({data_cleanup: "Data-cleanup", multithreading: "Multi-threading", multiprocessing: "Multi-processing"});
  const [ apiDesc, setApiDesc ] = useState({
    data_cleanup: "A quick and easy way to make your data look nicer.", 
    multithreading: "A substantial speed-up when scraping multiple pages at once.", 
    multiprocessing: "A way to make your scraping even faster, more resourcefull and more reliable."});

  const activateApiOption = ({optionType} : {optionType : string}) => {
    return;
  };

  const deactivateApiOption = ({optionType} : {optionType : string}) => {
    
  };

  if(apiOptionData.allowed){

    return (

      <div className={"px-1 h-full w-[30%] border-2 border-black rounded-lg bg-green-200 relative"} >
        <h2 className='font-[Inter] text-[16px] font-[700] text-start' > {apiNames[apiOptionData.type]} </h2>
        <p className="text-[12px] font-[600] text-start">{apiDesc[apiOptionData.type]}</p>

        <div className="w-[90%] flex flex-row items-center h-auto absolute bottom-1 justify-between" >
          <label className="text-[18px] font-[700]" > 
          Deactivate </label>
          <Image src={"./assets/icons/power_icon_red.svg"} alt="Dectivate function button" width={30} height={30} className="mt-[3px] cursor-pointer" 
            onClick={(e) => {deactivateApiOption({optionType: apiOptionData.type}); }} />
        </div>

      </div>
    );
  }
  else{

    return (

      <div className={"px-1 h-full w-[30%] border-2 border-black rounded-lg bg-red-200 relative"} >
        <h2 className='font-[Inter] text-[16px] font-[700] text-start' > {apiNames[apiOptionData.type]} </h2>
        <p className=" text-[12px] font-[600] text-start"> {apiDesc[apiOptionData.type]} </p>

        <div className="w-[90%] flex flex-row items-center h-auto absolute bottom-1 justify-between" >
          <label className="text-[18px] font-[700]" > 
          Activate </label>
          <Image src={"./assets/icons/power_icon_green.svg"} alt="Activate function button" width={30} height={30} className="mt-[3px] cursor-pointer"
            onClick={(e) => {activateApiOption({optionType: apiOptionData.type}); }} />
        </div>

      </div>
    
    );
  };
};

export default ApiOption;