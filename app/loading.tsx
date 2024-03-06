
import { BounceLoader } from "react-spinners";

export default function Loading(){

  return (
    <div className="c_row_elm items-center absolute justify-center top-[calc(40%-100px)] left-[calc(50%-100px)] " >
      <BounceLoader size={200} color="#9D40BE" speedMultiplier={2}/>
    </div>
   );
};