import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDb } from '@utils/api_funcs';
import User from '@models/user';


const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_OAUTH_ID,
            clientSecret: process.env.GOOGLE_OAUTH_SECRET,

        }),
    ],

    callbacks: {
        async session({ session }) {

            await connectToDb({dbName: "yows_users"});
            
            const sessionUser = await User.findOne({ email: session.user.email, });

            session.user["id"] = sessionUser._id.toString(); 
            return session;
        },
    
        async signIn({ profile }) {
    
            try{
    
                await connectToDb({dbName: "yows_users"});
    
                const userExists = await User.findOne({
                    email: profile.email,
                });
    
                if(!userExists){
                    console.log("CREATING USER!");
                    await User.create({
                        email: profile.email,
                        alias: "",
                        provider: "google",
                        image: profile.image,
                        description: "No description.",
                        all_saved_scrapes : [],
                        api: {
                            api_keys: [],
                            rate_limit: 10,
                        },
                        subscription: {
                            subscribed: 0,
                            tier: 0,
                            scraper_storage: 10,
                            max_runtime: 180,
                            max_loop_iterations: 10,
                            subscription_end: "null",
                            subscribed_months: 0,
                        },
                        
                    });
                }
                return true;
    
            }
            catch(error){
                console.log(error);
                return false;
            }
    
        },
    }
});


export {handler as GET, handler as POST};