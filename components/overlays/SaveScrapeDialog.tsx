"use client";

import { ScraperInfoResults } from "@custom-types";
import { adjustTextareaHeight, returnInputElementChecked, returnInputElementValue } from "@utils/generalFunctions";
import { FormEvent, MouseEvent } from "react";

const SaveScrapeDialog = ({results, generateExport} : 
  {
    results : ScraperInfoResults,
    generateExport : ({name, description, withRes} : {name : string | (() => string), description : string | (() => string), withRes : boolean}) => Promise<void>}) => {
  
  const submit = (e : MouseEvent<HTMLButtonElement, any> | FormEvent) => {
    e.preventDefault(); 
    generateExport({ 
      name: returnInputElementValue({elementId: "save-scrape-name"}), 
      description: returnInputElementValue({elementId: "save-scrape-desc"}), 
      withRes: !returnInputElementChecked({elementId: "save-scrape-results"}) 
    });
  };

  return (
    <form id={"save-scrape-form"} onSubmit={(e) => {submit(e)}} className="flex flex-col items-center justify-start gap-y-6 mt-3 w-full h-max " >

      <h2 className="text-[20px] font-[600] " >
        Please fill in a name and a description.
      </h2>

      <input maxLength={32} placeholder={"Name"} id={"save-scrape-name"} required
        className='min-w-[60%] w-auto text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 h-[40px]'/>
      
      <textarea maxLength={512}
        placeholder={"Description"} 
        id={"save-scrape-desc"} 
        className="min-w-[60%] w-auto h-max min-h-[120px] text-white dark:text-black placeholder:text-white dark:placeholder:text-black text-start border-2 border-gray-300 dark:border-gray-600 bg-[#424242] dark:bg-wsform-sideNav-light-bg p-1 rounded-s-none rounded-es-lg rounded-se-lg " 
        onChange={(e) => { adjustTextareaHeight({elementId: e.target.id, offset: 0}); }} />

      {     
        results !== undefined && !results.empty ? 
          (
            <label className="inline-flex items-center cursor-pointer">
              <h3 className="pr-4 text-[18px] text-start font-[600] mb-[6px]" >Save results:</h3>
              <input id="save-scrape-results" type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          )
          :
          (
            <label className="inline-flex items-center cursor-not-allowed">
              <h3 className="pr-4 text-[18px] text-start font-[600] mb-[6px]" >Save results:</h3>
              <input id="save-scrape-results" type="checkbox" className="sr-only peer" disabled />
              <div className="relative w-11 h-6 bg-stone-400 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          )
      }
      
      <button id={"submit-save-scrape-btn"} className='dark:hover:animate-navColorFadeLight dark:hover:text-black hover:animate-navColorFadeDark hover:text-white border-[1px] rounded-lg border-gray-600 dark:border-gray-300 p-2 text-[18px] w-[100px] h-[45px] text-center font-[600]' onClick={(e) => {submit(e)}} >
        Submit
      </button>

    </form>
  );
};

export default SaveScrapeDialog;