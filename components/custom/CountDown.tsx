"use client";

import { useEffect, useRef, useState } from "react";


const CountDown = ({message, seconds} : {message : string, seconds : number}) => {

  const [countdown, setCountdown] = useState(seconds);
  const timerId = useRef();

  useEffect(() => {
    timerId.current= setInterval(() => {setCountdown((prevCountdown) => {return prevCountdown - 1})}, 1000)  as any ;
    return () => {clearInterval(timerId.current)};
  }, []);

  useEffect(() => {
    if(countdown <= 0){
      clearInterval(timerId.current);
    };
  }, [countdown])

  return (
    <h2 id="countdown" className="text-[20px] font-[600] font-inter">{`${message}: ${countdown}sec`}</h2>
  );
};

export default CountDown;