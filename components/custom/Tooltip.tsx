const Tooltip = ({content, xOrientation, yOrientation} : {content: string, xOrientation? : string, yOrientation? : string}) => {

  const possibleClassnames = ["bottom-full", "top-full", "top-full", "bottom-full", "left-0", "right-0"];

  if(!xOrientation){ xOrientation = "middle"};
  if(!yOrientation){ yOrientation = "top"};

  return (
    <div className={`hidden group-hover:flex absolute z-[10000] items-center  w-[250px] ${yOrientation}-full ${xOrientation === "middle" ? "-right-[calc(125px-50%)] justify-center" : `${xOrientation}-0 justify-start`}`} >
      <div className={` bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg w-fit min-h-[33px] max-h-[99px] rounded-lg p-[3px] shadow-[0px_0px_8px_#000000]`} >
        <p className=" text-center text-[14px] font-[500] font-[Helvetica] text-white dark:text-black break-words " >
          {content}
        </p>
      </div>
    </div>
    
  );
};

export default Tooltip;