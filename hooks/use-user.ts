import { getFromLocalstorage } from "@/actions/get-from-localstorage";
import { setInLocalstorage } from "@/actions/set-in-localstorage";
import { User } from "@/interfaces/user.interface";
import { auth, getDocument } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { usePathname,useRouter } from "next/navigation";

import { useEffect, useState } from "react"

export const useUser =()=>{


    const [user, setUser] = useState<User|undefined| DocumentData>(undefined)

    const pathName = usePathname();
    const router = useRouter();

  const protectedRoutes = ['/sign-up', '/dashboard']
  const isInProtectedRoute = protectedRoutes.includes(pathName)

    const getUserFromDB=async(uid:string)=>{
        const path = `users/${uid}`
        try {
            const res =await getDocument(path)
            setUser(res);
            setInLocalstorage('user',res);
            
        } catch (error:unknown) {
            
        }

    }
    useEffect(() => {
        
        return onAuthStateChanged(auth,async(authUser)=>{
            if(authUser) {
                const userInLocal = getFromLocalstorage('user');
                if(userInLocal)setUser(userInLocal);
                else getUserFromDB(authUser.uid);
                // User is signed in, update state accordingly
            } else {
                if(isInProtectedRoute)router.push('/');
                // User is signed out, update state accordingly
            }
        })
    }, []);

    return user;

}