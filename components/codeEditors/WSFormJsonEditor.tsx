"use client";

import { useContext, useCallback, useState, Dispatch, SetStateAction } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { themeContext } from '@components/layout/Provider';

// Experimental and very advanced(for the user) feature.
const WSFormJsonEditor = ({ scrapeIdx, scraper, setScraper, valid } : 
  {
    scrapeIdx : number
    scraper : ScraperData
    setScraper : Dispatch<SetStateAction<ScraperData>>
    valid : boolean
  }) => {

  const themeContextAccess = useContext<ThemeContextValue>(themeContext);

  const [ value, setValue ] = useState(JSON.stringify(scraper.scrapes[scrapeIdx], null, 2));

  const handleValueChange = useCallback((val : string, viewUpdate) => {
    setValue(val);
  }, []);

  const saveValueChanges = () => {

    try{
      const parsed = JSON.parse(value);

      const newAll = scraper.scrapes;
      newAll[scrapeIdx] = parsed   

      if(!newAll[scrapeIdx].loop || !newAll[scrapeIdx].workflow || !newAll[scrapeIdx].scrape_params){ return; };

      setScraper((prevScraper) => ({
        ...prevScraper,
        all : newAll,
      }));
    }
    catch{
      return;
    }; 
  };

  return (
    <div className='flex flex-col items-center gap-y-2 w-full h-auto pb-4' >
      <CodeMirror 
        theme={themeContextAccess.data} 
        value={value} 
        className={`w-[95%] h-auto m-2 border-2 break-words rounded-sm ${ value === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500")}`} 
        basicSetup={{lineNumbers: false}} 
        extensions={[json()]} 
        onChange={handleValueChange} 
      /> 

      <button className='p-2 text-[20px] font-[500] border-2 border-gray-600 dark:border-gray-300 rounded-lg ' onClick={saveValueChanges} >
        Save
      </button>
    </div>
  );
};

export default WSFormJsonEditor;