"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


const BuyPage = () => {

  const [ params, setParams ] = useState(useSearchParams());
  const [ subInfo, setSubInfo ] = useState(null);

  const getInfos = async () => {

    const subInfoUrl = "http://localhost:8000/api/getsubinfo?" + new URLSearchParams({
      api_key: "felix12m",
      type: params.get("type"),
    })
    const subInfo = await fetch(subInfoUrl, {
      method: "GET",
    }).then((response) =>{

      if(!response.ok){
        console.log("Error when fetching sub infos");
      }
      else{
        return response.json();
      }
    });

    setSubInfo(subInfo);

  };

  useEffect(() => {
    getInfos();
  }, [])

  return (
    <section id="buy-page-section" className="w-full h-full mt-5" >

      <h1 className="subhead_text"> {params.get("type")} </h1>

    </section>

  );
};

export default BuyPage;