const Tooltip = ({content, xOrientation, yOrientation} : {content: string, xOrientation? : string, yOrientation? : string}) => {

  const possibleClassnames = ["bottom-full", "top-full", "top-full", "bottom-full", "left-[5%]", "right-[5%]"];

  if(!xOrientation){ xOrientation = "right"};
  if(!yOrientation){ yOrientation = "top"};

  return (
    <div className={`absolute z-[10000] flex items-center bg-wsform-sideNav-dark-bg dark:bg-wsform-sideNav-light-bg min-w-[110px] w-max max-w-[260px] min-h-[33px] max-h-[99px] ${yOrientation}-full ${xOrientation}-[5%] rounded-lg py-[3px] px-[3px] shadow-[0px_0px_8px_#000000]`} >
      <p className=" text-center text-[14px] font-[600] font-[Helvetica] text-white dark:text-black break-words " >
        {content}
      </p>
    </div>
  );
};

export default Tooltip;