// Import the functions you need from the SDKs you need
// import { User } from "@/interfaces/user.interface";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, uploadString,getDownloadURL,ref, deleteObject} from "firebase/storage";
import toast from "react-hot-toast";



const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
// Initialize Firebase
export default app;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage (app);

//--------------auth funtion --------------------------------
//--sign in --------------------------------
export const SignIn=async (user:{email:string,password:string})=>{
  return await signInWithEmailAndPassword(auth,user.email,user.password);
  
}
export const createUser=async(user:{email:string,password:string})=>{
  
  return await createUserWithEmailAndPassword(auth,user.email,user.password);
  
}

export const updateUser=async (user: { displayName?: string | null|undefined; photoURL?: string | null|undefined })=>{
  if(auth.currentUser)return updateProfile(auth.currentUser,user)
    
  }
  
  export const sendResetEmail=async(email:string)=>{
    return await sendPasswordResetEmail(auth,email);
    
    
  }
  export const signOutAccount=()=>{
    localStorage.removeItem('user');
  return auth.signOut();
  
  
}

// <======================Database Functions =================>

// <=======gets dosc a  collection ======>

  export const getCollection = async (collectionName: string,queryArray?:any[]) => {
    const ref = await collection(db,collectionName);
    const q = queryArray? query(ref,...queryArray):query(ref);
    return (await getDocs(q)).docs.map((doc)=>({id: doc.id, ...doc.data()})) ;
  };





// <=======setear un docuemnto en una collection ======>

  
  export const getDocument = async (path: string) => {
    return (await getDoc(doc(db,path))).data();
    
  };
  //=========================ADD DOCUMENT========================
  
  export const addDocument = async (path: string, data: any) => {
    
    data.createdAt = serverTimestamp() 
    
    return addDoc(collection(db,path),data)
  };


  export const setDocument = async (path: string, data: any) => {
    
    data.createdAt = serverTimestamp() 
    
    return setDoc(doc(db,path),data)
  };
  
  
  //--------------storage funtion --------------------------------




      //-------------subir imagen --------
      export const uploadBase64 = async (path: string, base64: string) => {
        return await uploadString(ref(storage,path),base64,'data_url').then(()=>{
          return getDownloadURL(ref(storage,path));
        });
        
      }
      //-------------emilinar imagen --------
      export const deleteImage = async (path: string) => {
        const imageRef = ref(storage, path);
        try {
          await deleteObject(imageRef);
          
        } catch (error) {
          toast.error(`Error al eliminar la imagen de Storage: ${error}`, );
          throw new Error("No se pudo eliminar la imagen");
        }
      };
      
      //-------------actualizar imagen --------
  export const updateDocument = async (path: string, data: any) => {

    return updateDoc(doc(db,path),data)
  };
  
      //-------------eliminar document --------
  export const deleteDocument = async (path: string) => {

    return deleteDoc(doc(db,path))
  };
  

