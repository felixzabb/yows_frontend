"use client";

import { useEffect, useRef, useState } from "react";

const CountDown = ({ message, seconds } : { message : string, seconds : number }) => {

  const [ countdown, setCountdown ] = useState(seconds);
  const timerId = useRef();

  // Create the timer interval and clear it on route change.
  useEffect(() => {
    timerId.current= setInterval(() => { setCountdown((prevCountdown) => {return prevCountdown - 1}) }, 1000)  as any;
    return () => { clearInterval(timerId.current) };
  }, []);

  // Clear countdown if the time is up.
  useEffect(() => {
    if(countdown <= 0){
      clearInterval(timerId.current);
    };
  }, [countdown])

  return (
    <h2 className="text-[20px] font-[600] font-inter">{`${message}: ${countdown}sec`}</h2>
  );
};

export default CountDown;