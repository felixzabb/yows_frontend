"use client";

import Link from "next/link";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import Dropdown from "./small_components/Dropdown";


const Nav = () => {
	
	const { data: theSession } = useSession();

  return(

		<nav className="nav c_row_elm">

			<Link href='/'>

				<Image src='/assets/icons/planet_logo.svg'
					alt="Yows logo"
					className="object-contain rounded-full"
					width={50}
					height={50} />

			</Link>

			{
				theSession?.user ? 
					( 

						<div className="flex flex-row w-fit h-auto justify-between gap-x-5 ">

							<Link href="/new-scraper" >

								<button type="button" className="purple_btn" >

									New 

								</button>
							
							</Link>

							<Link href="/saved-scrapes" >

								<button type="button" className="purple_btn" >
									Saved 
								</button>
							
							</Link>

							<Dropdown options={{errors : {name : "Errors", href: "/errors"}, docs : {name : "Docs", href:"/docs"}}} />

							<Link href='/profile'>

								<Image src={theSession.user.image} width={50} height={50}
																alt="profile" className='rounded-full' 
														/>
				
							</Link>

							
						</div>

						
					)

					:

					(
						<>
							{
								theSession === undefined ? 
								(
									<ScaleLoader height={50} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" className="mr-3  " />
								)
								:
								(
									<>
										<Link href='/signup'>

											<button type="button" className="purple_btn" >

												Sign up/in

											</button>
						
										</Link>
									</>

								)
							}
							
							
						</>
					)
				}
		</nav>
	)
}

export default Nav;