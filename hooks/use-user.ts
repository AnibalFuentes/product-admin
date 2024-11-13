import { getFromLocalstorage } from "@/actions/get-from-localstorage";
import { setInLocalstorage } from "@/actions/set-in-localstorage";
import { User } from "@/interfaces/user.interface";
import { auth, getDocument } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState<User | undefined | DocumentData>(undefined);
  const pathName = usePathname();
  const router = useRouter();

  const protectedRoutes = [
    "/sign-up",
    "/dashboard",
    "/dashboard/users",
    "/dashboard/solicitudes",
  ];
  const isInProtectedRoute = protectedRoutes.includes(pathName);

  const getUserFromDB = async (uid: string) => {
    const path = `usuarios/users`;
    try {
      const res = await getDocument(path);
      
      // Buscar el usuario en el array `users` dentro del documento `usuarios`
      const userFromArray = res?.users.find((user: User) => user.uid === uid);

      if (userFromArray) {
        setUser(userFromArray);
        setInLocalstorage("user", userFromArray);
      } else {
        console.warn("Usuario no encontrado en la base de datos.");
      }
    } catch (error: unknown) {
      console.error("Error al obtener el usuario:", error);
    }
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userInLocal = getFromLocalstorage("user");
        if (userInLocal) setUser(userInLocal);
        else getUserFromDB(authUser.uid);
      } else {
        if (isInProtectedRoute) router.push("/");
      }
    });
  }, [isInProtectedRoute, router]);

  return user;
};
