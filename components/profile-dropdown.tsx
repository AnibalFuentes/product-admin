"use client";
import fileToBase64 from "@/actions/convert-file-to-base64";
import { setInLocalstorage } from "@/actions/set-in-localstorage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import {
  getDocument,
  signOutAccount,
  updateDocument,
  uploadBase64,
} from "@/lib/firebase";
import {
  CircleUserRound,
  FileText,
  ImagePlus,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ModeToggle } from "./toggle-mode";

const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export function ProfileDropdown() {
  const { user } = useUser();
  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar el tipo MIME del archivo
    const validImageTypes = ["image/png", "image/webp", "image/jpeg"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Solo se permiten archivos de imagen (PNG, WEBP, JPEG).", {
        duration: 2500,
      });
      event.target.value = ""; // Limpiar el input si el archivo no es válido
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const imagePath = `${user?.uid}/profile`;
      const imageUrl = await uploadBase64(imagePath, base64);

      // Obtener el documento "users" de la colección "usuarios"
      const usersDoc = await getDocument("usuarios/users");
      const usersArray = usersDoc?.users || [];

      // Actualizar solo el usuario correspondiente en el array
      const updatedUsers = usersArray.map((u: any) =>
        u.uid === user?.uid
          ? { ...u, image: { url: imageUrl, path: imagePath } }
          : u
      );

      // Actualizar el documento "users" en la colección "usuarios"
      await updateDocument("usuarios/users", { users: updatedUsers });

      // Actualizar el estado local de la imagen
      setImage(imageUrl);
      if (user) {
        user.image = { url: imageUrl, path: imagePath }; // Actualizar la referencia local
        setInLocalstorage("user", user);
      }

      toast.success("Perfil actualizado con éxito");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error desconocido";
      toast.error(errorMessage, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.image?.url) setImage(user.image.url);
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="mx-4">
          <span className="mr-2">Cuenta</span>

          {image ? (
            <Image
              src={image}
              alt="user-img"
              width={1000}
              height={1000}
              className="object-cover w-6 h-6 rounded-full m-auto"
            />
          ) : (
            <CircleUserRound className="m-auto w-6 h-6" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="text-center">
          {isLoading ? (
            <LoaderCircle className="w-14 h-14 animate-spin m-auto mb-3" />
          ) : (
            <>
              {image ? (
                <Image
                  src={image}
                  alt="user-img"
                  width={1000}
                  height={1000}
                  className="object-cover w-20 h-20 rounded-full m-auto"
                />
              ) : (
                <CircleUserRound className="m-auto w-20 h-20" />
              )}
              <div className="flex justify-center relative bottom-2 ">
                <div>
                  <input
                    id="files"
                    className="hidden"
                    type="file"
                    accept="image/png, image/webp, image/jpeg"
                    onChange={(e) => chooseImage(e)}
                  />
                  <label htmlFor="files">
                    <div className="w-[40px] cursor-pointer rounded-lg text-white h-[28px] bg-slate-950 hover:bg-slate-800 flex justify-center items-center">
                      <ImagePlus className="w-[18px] h-[18px] " />
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}

          <div>{user?.name ? capitalizeWords(user.name) : ""}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <FileText className="mr-2 h-4 w-4" />
            <span>Terminos y Condiciones</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Soporte</span>
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem onClick={() => signOutAccount()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
