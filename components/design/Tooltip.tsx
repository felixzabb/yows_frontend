const Tooltip = ({content, xOrientation="left", yOrientation="top"} : {content: string, xOrientation? : string, yOrientation? : string}) => {

  const possibleClassnames = ["bottom-[calc(100%+4px)", "top-[calc(100%+4px)]"]

  if(xOrientation === "left" || xOrientation === null || xOrientation === undefined){
    let className = "";
    if(yOrientation === "top"){
      className = "bottom";
    }
    else{
      className = "top";
    }

    return (
      <div className={`absolute flex items-center bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg min-w-[150px] w-[90%] max-w-[400px] min-h-[33px] max-h-[66px] ${className}-[calc(100%+4px)] right-[5%] rounded-lg py-[3px] px-[6px] shadow-[0px_0px_8px_#000000]`} >
        <p className=" text-center text-[14px] font-[600] font-[Helvetica] text-white dark:text-black break-words " >
          {content}
        </p>
      </div>
    );
  }
  else if(xOrientation === "right"){

    let className = "";
    if(yOrientation === "top"){
      className = "bottom";
    }
    else{
      className = "top";
    }

    return (
      <div className={`absolute flex items-center bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg min-w-[100px] w-[90%] max-w-[400px] min-h-[33px] max-h-[66px] ${className}-[calc(100%+4px)] left-[5%] rounded-lg py-[3px] px-[6px] shadow-[0px_0px_8px_#000000]`} >
        <p className=" text-center text-[14px] font-[600] font-[Helvetica] text-white dark:text-black break-words " >
          {content}
        </p>
      </div>
    );
  }
  


};

export default Tooltip;