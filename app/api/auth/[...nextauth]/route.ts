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
                        username: profile.name.replaceAll(" ", "").toLowerCase(),
                        image: profile.image,
                        description: "No description.",
                        api_options : {
                            multiprocessing: false,
                            multithreading: false,
                            data_cleanup: false,
                            max_scrapes: "10",
                        },
                        provider: "Google",
                        api_interaction: {
                            api_keys: [],
                            blocked: false,
                            price_per_request: null,
                            sub_runtime: null,
                            sub_id: null,
                        },
                        all_saved_scrapes : [],
                        
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