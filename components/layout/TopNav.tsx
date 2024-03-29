"use client";

import Link from "next/link";
import Image from "next/image";
import { ScaleLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import NavDropdown from "../dropdowns/NavDropdown";
import { useContext } from "react";
import { themeContext } from "./Provider";

const TopNav = () => {

	const themeContextAccess = useContext<ThemeContextValue>(themeContext);
	
	const { data: sessionData, status: authStatus } = useSession();

	const switchColorMode = () : void => {


		const colorMode = themeContextAccess.data;
		console.log(colorMode)

		const colorModeTransformer : { dark: "light", light: "dark" } = { dark: "light", light: "dark" }

		if(!["dark", "light"].includes(colorMode)){ return; };

		window.document.getElementById("html-elm").classList.add(colorModeTransformer[colorMode]);
		window.document.getElementById("html-elm").classList.remove(colorMode);

		window.localStorage.setItem("colorMode", colorMode);

		themeContextAccess.change(colorModeTransformer[colorMode]);
	};
	
  return(
		<nav id="topNav-container" className="flex flex-row items-center px-6 justify-between w-full h-[44px] pb-1 border-b-2 border-gray-400">

			<Link href='/'>
				<Image priority 
					src='/assets/icons/logo/yows_logo_1.svg'
					alt="Yows logo"
					className="object-contain rounded-full"
					width={40} height={40} 
				/>
			</Link>

			

			<div className="flex flex-row items-center w-fit h-[50px] justify-between gap-x-2 pr-1 ">

				{
					authStatus === "loading" && (
						<ScaleLoader height={40} width={4} margin={3} speedMultiplier={2} color="#8A2BE2" className="mr-3" />
					)
				}

				{
					authStatus === "authenticated" && (
						<>
							<Link href="/new"  className="text-[20px] font-[Helvetica] font-[500] px-2 py-[3px] rounded-lg hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark" >
								New 
							</Link>

							<Link href="/saved" className="text-[20px] font-[Helvetica] font-[500] px-2 py-[3px] rounded-lg hover:animate-navColorFadeLight  dark:hover:animate-navColorFadeDark" >
								Saved 
							</Link>

							<NavDropdown 
								thingToClick={<span className="text-[20px] font-[Helvetica] font-[500] px-2 py-[6px] rounded-lg hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark " >Help</span>}
							/>

							<hr className="h-[40px] w-[2px] bg-gray-400 " />

							<Link href='/profile?section=general'>
								<Image
									src={sessionData?.user.image} 
									width={34} height={34}
									alt="Profile" 
									className='object-contain rounded-full mt-[2px]' 
								/>
							</Link>
						</>
					)
				}

				{
					authStatus === "unauthenticated" && (
						<>
							<Link href='/auth?mode=up' className="text-[20px] font-[Helvetica] font-[500] w-auto px-2 py-[3px] rounded-lg hover:animate-navColorFadeLight dark:hover:animate-navColorFadeDark" >
								Sign up/in
							</Link>
						</>
					)
				}

				{
					themeContextAccess.data === "dark" ?
						(
							<Image
								src="/assets/icons/colorMode/dark_mode_moon.svg"
								alt="Color mode switch"
								width={34} height={34}
								onClick={switchColorMode}
							/>
						)
						:
						(
							<Image
								src="/assets/icons/colorMode/light_mode_sun.svg"
								alt="Color mode switch"
								width={34} height={34}
								onClick={switchColorMode}
							/>
						)
				}
				
			</div>
		</nav>
	);
};

export default TopNav;