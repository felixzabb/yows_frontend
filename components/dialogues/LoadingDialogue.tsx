"use client";

import CountDown from "@components/custom/CountDown";
import { ClockLoader } from "react-spinners";

const LoadingDialogue = ({ expectedWaitTime } : { expectedWaitTime : number }) => {
  return(
    <>
      <ClockLoader size={200} speedMultiplier={2} />
      <CountDown message="Time left" seconds={expectedWaitTime} />
    </>
  );
};

export default LoadingDialogue;