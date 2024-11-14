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
        const authUser = auth.currentUser;
        
        // Verificar si el email está verificado
        if (authUser?.emailVerified) {
          setUser(userFromArray);
          setInLocalstorage("user", userFromArray); // Guardar el usuario en local storage solo si el email está verificado
        } else {
          auth.signOut();
          console.warn("El email del usuario no está verificado.");
        }
      } else {
        console.warn("Usuario no encontrado en la base de datos.");
      }
    } catch (error: unknown) {
      console.error("Error al obtener el usuario:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await getUserFromDB(authUser.uid); // Llamar siempre a `getUserFromDB` al iniciar sesión
      } else {
        // Redirigir a la página de inicio si el usuario no está autenticado y está en una ruta protegida
        if (isInProtectedRoute) router.push("/");
        setUser(undefined); // Limpiar el estado `user` cuando no hay usuario autenticado
      }
    });
    return () => unsubscribe();
  }, [isInProtectedRoute, router]);

  return user;
};
