import { getFromLocalstorage } from "@/actions/get-from-localstorage";
import { setInLocalstorage } from "@/actions/set-in-localstorage";
import { Entity, User } from "@/interfaces/user.interface";
import { auth, getDocument } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useUser = () => {
  const [user, setUser] = useState<User | undefined | DocumentData>(undefined);
  const [eps, setEps] = useState<Entity[] | undefined | DocumentData>(
    undefined
  );
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
      const epss = res?.eps;
      console.log(epss.length);

      if (userFromArray) {
        // Verificar si el email está verificado

        setUser(userFromArray);
        setInLocalstorage("user", userFromArray); // Guardar el usuario en local storage solo si el email está verificado
      }
      if (userFromArray.role === "ADMINISTRADOR" && epss) {
        // Verificar si el email está verificado

        setEps(epss);
        setInLocalstorage("eps", epss); // Guardar el usuario en local storage solo si el email está verificado
      }
    } catch (error: unknown) {}
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        await getUserFromDB(authUser.uid); // Llamar siempre a `getUserFromDB` al iniciar sesión
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("eps");

        localStorage.clear();
        // Redirigir a la página de inicio si el usuario no está autenticado y está en una ruta protegida
        if (isInProtectedRoute) router.push("/");
        setUser(undefined); // Limpiar el estado `user` cuando no hay usuario autenticado
      }
    });
    return () => unsubscribe();
  }, [isInProtectedRoute, router]);

  return { user, eps };
};
