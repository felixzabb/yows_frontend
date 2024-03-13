import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { CreateUser, checkUserLoginValid, connectToDb } from '@utils/api_funcs';
import User from '@models/user';


const handler = NextAuth({
	session: {
		strategy: "jwt"
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_OAUTH_ID,
			clientSecret: process.env.GOOGLE_OAUTH_SECRET,
			
		}),
		Credentials({
			type: "credentials",
			credentials: {},
			async authorize(credentials, req){
				
				const { email, password } = credentials as {
					email : string
					password : string
				};
				
				try{
					const validCheck = await checkUserLoginValid({apiKey: "felix12m", email: email, password: password});
					
					if(!validCheck.acknowledged){ throw new Error(validCheck.errors.at(0), {cause: "VALID_CHECK_FAILED"}); };
					
					return {id: validCheck.user._id, email: validCheck.user.email, alias: validCheck.user.alias, image: validCheck.user.image};
				}
				catch(error){
					if(error.cause === "VALID_CHECK_FAILED"){
						throw new Error(error.message);
					}
					console.log(error);
					return null;
				}
				
			},
		}),
	],
	pages: {
		signIn: "/signup",
		error: "/signup?app_error=AUTH-SIGNIN-3&e_while=signing%20in%20with%20OAuth",
	},
	
	callbacks: {
		async session({ session }) {
			
			await connectToDb({dbName: "yows_users"});
			
			const sessionUser = await User.findOne({ email: session.user.email });
			
			if(!sessionUser){ return null; }
			
			session.user["alias"] = sessionUser.alias;
			session.user.image = sessionUser.image;
			session.user["id"] = sessionUser._id.toString(); 
			
			return session;
		},
		
		async signIn({ profile, account }) {
			
			const authProvider = account.provider;
			if(authProvider === "credentials"){ return true; };
			
			try{
				
				await connectToDb({dbName: "yows_users"});
				
				const possibleUser = await User.findOne({
					email: profile.email,
				});
				
				if(possibleUser){ 
					throw new Error("AUTH-SIGNIN-3", {cause: "USER_ALREADY_EXISTS"});
				};
				
				await CreateUser({apiKey: "felix12m", provider: authProvider, email: profile.email, alias: "none", image: profile["picture"], scheme: "default"})
				
				return true;
				
			}
			catch(error){
				if(error.cause === "USER_ALREADY_EXISTS"){
					throw new Error(error.message);  
				}
				console.log(error);
				return false;
			}
			
		}
	}
});


export {handler as GET, handler as POST};