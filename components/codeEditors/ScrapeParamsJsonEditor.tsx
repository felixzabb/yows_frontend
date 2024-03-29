"use client";

import { useContext, useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { themeContext } from '@components/layout/Provider';

const ScrapeParamsJsonEditor = ({ handleScrapeParamsChange, scraper, scrapeIdx, paramName, valid } : 
  {
    scrapeIdx : number
    scraper : ScraperData
    handleScrapeParamsChange : ({ scrapeIdx, paramName, value } : { scrapeIdx : number, paramName : string, value : string | string[] | number | boolean }) => void
    paramName : string
    valid : boolean
  }) => {

  const themeContextAccess = useContext<ThemeContextValue>(themeContext);

  const currentData : string = scraper.scrapes[scrapeIdx].scrape_params[paramName];

  const [ value, setValue ] = useState(currentData.length === 0 ? "[\n\n]" : JSON.stringify(currentData, null, 2));

  const handleValueChange = useCallback((val : string, viewUpdate) => {

    setValue(val);
    
    try{
      const parsed = JSON.parse(val);
      handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: paramName, value: parsed });
    }
    catch{
      handleScrapeParamsChange({ scrapeIdx: scrapeIdx, paramName: paramName, value: ["\n\t\n"] });
    }
  }, []);

  return (
    <CodeMirror 
      theme={themeContextAccess.data} 
      value={value} 
      className={` w-full border-2 text-[16px] rounded-sm ${ value === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500") }`} 
      basicSetup={{lineNumbers: false}} 
      extensions={[json()]} 
      onChange={handleValueChange} 
    /> 
  );
};

export default ScrapeParamsJsonEditor;