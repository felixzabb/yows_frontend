"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


const BuyPage = () => {

  const [ params, setParams ] = useState(useSearchParams());
  const [ subInfo, setSubInfo ] = useState(null);

  const getInfos = async () => {};

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