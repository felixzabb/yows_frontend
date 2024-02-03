
import DotLoader from "react-spinners/DotLoader";

export default function Loading(){

  return (
    <div className="c_row_elm items-center absolute justify-center top-[calc(50%-100px)] left-[calc(50%-100px)] " >
      <DotLoader size={200} color="#9D40BE" speedMultiplier={2}/>
    </div>
   );
};