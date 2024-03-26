"use client";

import { useContext, useCallback, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { appContext } from '@components/layout/Provider';
import { CustomAppContext, ScraperInfos } from '@custom-types';

const CssSelectorJsonEditor = ({ handleChange, scraperInfos, scrapeIdx, workflowIndex, valid } : 
  {
    scrapeIdx : number
    scraperInfos : ScraperInfos
    workflowIndex : number
    handleChange: ({ scrapeIdx, workflowIndex, paramName, value }: { scrapeIdx: number, workflowIndex: number, paramName: string, value: any }) => void
    valid : boolean
  }) => {

  const context = useContext<CustomAppContext>(appContext);

  const [value, setValue] = useState(scraperInfos.all[scrapeIdx].workflow[workflowIndex].data.css_selector[0] === "" ? "[\n\t\n]" : JSON.stringify(scraperInfos.all[scrapeIdx].workflow[workflowIndex].data.css_selector));

  const onChange = useCallback((val : string, viewUpdate) => {

    setValue(val);

    try{
      const parsed = JSON.parse(val);
      handleChange({scrapeIdx: scrapeIdx, workflowIndex: workflowIndex, paramName: "css_selector", value: parsed});
    }
    catch{
      handleChange({scrapeIdx: scrapeIdx, workflowIndex: workflowIndex, paramName: "css_selector", value: [""]});
    }

  }, []);

  return (
    <CodeMirror theme={context.appContextData.colorMode} value={value} className={`w-full border-2 rounded-sm ${
      value === "" ? "border-gray-600 dark:border-gray-300" : (valid ? "border-green-500" : "border-red-500")
    }`} basicSetup={{lineNumbers: false}} extensions={[json()]} onChange={onChange} /> 
  );
};

export default CssSelectorJsonEditor;