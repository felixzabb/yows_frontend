"use client";

import { useContext, useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { themeContext } from '@components/layout/Provider';

const ActionDataJsonEditor = ({ handleActionChange, scraper, scrapeIdx, workflowIndex, paramName, valid } : 
  {
    valid: boolean
    scrapeIdx : number
    scraper : ScraperData
    workflowIndex : number
    paramName : string
    handleActionChange: ({ scrapeIdx, workflowIndex, paramName, value }: { scrapeIdx: number, workflowIndex: number, paramName: string, value?: string | string[] | number, as?: ActionDataType }) => void
  }) => {

  const themeContextAccess = useContext<ThemeContextValue>(themeContext);
  const currentData : string = scraper.scrapes[scrapeIdx].workflow[workflowIndex].data[paramName];

  const [ value, setValue ] = useState(currentData.length === 0 ? "[\n\n]" : JSON.stringify(currentData, null, 2));

  const handleValueChange = useCallback((val : string, viewUpdate) => {

    setValue(val);
    
    try{
      const parsed = JSON.parse(val);
      handleActionChange({ scrapeIdx: scrapeIdx, workflowIndex: workflowIndex, paramName: paramName, value: parsed });
    }
    catch{
      handleActionChange({ scrapeIdx: scrapeIdx, workflowIndex: workflowIndex, paramName: paramName, value: ["\n\n"] });
    }

  }, []);

  return (
    <CodeMirror 
      theme={themeContextAccess.data} 
      value={value} 
      className={`w-full border-2 text-[16px] rounded-sm ${ value === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500") }`} 
      basicSetup={{lineNumbers: false}} 
      extensions={[json()]} 
      onChange={handleValueChange} 
    /> 
  );
};

export default ActionDataJsonEditor;