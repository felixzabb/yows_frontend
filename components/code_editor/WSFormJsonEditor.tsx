"use client";

import { useContext, useCallback, useState, Dispatch, SetStateAction } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { appContext } from '@components/layout/Provider';
import { CustomAppContext, ScraperInfos } from '@custom-types';

const WSFormJsonEditor = ({scrapeIdx, scraperInfos, setScraperInfos, valid } : 
  {
    scrapeIdx : number
    scraperInfos : ScraperInfos
    setScraperInfos : Dispatch<SetStateAction<ScraperInfos>>
    valid : boolean
  }) => {

  const context = useContext<CustomAppContext>(appContext);

  const [value, setValue] = useState(JSON.stringify(scraperInfos.all[scrapeIdx], null, 2));

  const onChange = useCallback((val : string, viewUpdate) => {
    setValue(val);
  }, []);

  const saveChanges = () => {

    const newAll = scraperInfos.all;
    try{
      newAll[scrapeIdx] = JSON.parse(value)
    }
    catch{
      return;
    }

    if(!newAll[scrapeIdx].loop || !newAll[scrapeIdx].workflow || !newAll[scrapeIdx].scrape_params){ return; };
    
    setScraperInfos((prevScraperInfos) => ({
      ...prevScraperInfos,
      all : newAll,
    }));
  };

  return (
    <div className='flex flex-col items-center gap-y-2 w-full h-auto pb-4' >
      <CodeMirror theme={context.appContextData.colorMode} value={value} className={`w-[95%] h-auto m-2 border-2 break-words rounded-sm ${
        value === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500")
      }`} basicSetup={{lineNumbers: false}} extensions={[json()]} onChange={onChange} /> 

      <button className='p-2 text-[20px] font-[500] border-2 border-gray-600 dark:border-gray-300 rounded-lg ' onClick={saveChanges} >
        Save
      </button>
    </div>
  );
};

export default WSFormJsonEditor;