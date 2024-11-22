"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { TableView } from "./table-view";
import { User } from "@/interfaces/user.interface";
import toast from "react-hot-toast";
import { CirclePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListView from "./list-view";
import { arrayRemove } from "firebase/firestore";
import { DEFAULT_USER_IMAGE_URL } from "@/constants/constants";
import { Input } from "@/components/ui/input";
import { CreateUpdateItem } from "./create-update-item.form";
import { deleteImage, getDocument, updateDocument } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";

const Items = () => {
  const { user } = useUser();
  const [items, setItems] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Nuevo estado para el filtro

  const isMolbile = useIsMobile();

  //=========OBTENER USUARIOS DE FIRESTORE
  const getItems = async () => {
    const path = `usuarios/users`;

    setIsLoading(true);
    try {
      const res = (await getDocument(path)) as { users: User[] };
      if (res && res.users) {
        setItems(res.users);
      } else {
        setItems([]);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 });
      } else {
        toast.error("Ocurrió un error desconocido", { duration: 2500 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  //================ELIMINAR USUARIO DE FIRESTORE
  const deleteUserInDB = async (item: User) => {
    const path = `usuarios/users`;
    setIsLoading(true);

    const defaultImageUrl = DEFAULT_USER_IMAGE_URL;

    try {
      if (item.image?.url && item.image.url !== defaultImageUrl) {
        await deleteImage(item.image.url);
      }

      await updateDocument(path, {
        users: arrayRemove(item),
      });

      toast.success("Usuario Eliminado Exitosamente 🗑️", { duration: 2500 });

      const newItems = items.filter((i) => i.uid !== item.uid);
      setItems(newItems);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 });
      } else {
        toast.error("Ocurrió un error desconocido", { duration: 2500 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) getItems();
  }, [user]);

  // Filtrar usuarios en función del término de búsqueda para todos los campos
  const filteredItems = items.filter((item) =>
    Object.values(item).some(
      (field) =>
        typeof field === "string" &&
        field.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
  );

  return (
    <div className="flex flex-col">
      <div className="flex justify-between  my-8 items-center">
        <div className=" flex items-center w-64">
          {" "}
          {/* Controla el ancho aquí */}
          <Input
            type="text"
            placeholder="🔎 Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Añade padding a la derecha para el icono
          />
          {/* {searchTerm&& !isMolbile && (
            <button
              onClick={() => setSearchTerm('')}
            className="absolute right-2 p-1"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          )} */}
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm("")}
              variant={"ghost"}
              className=" hover:bg-transparent"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-gray-70" />
            </Button>
          )}
        </div>
        <CreateUpdateItem getItems={getItems}>
          <Button className="">
            {!isMolbile && "Crear"}
            <CirclePlus className=" w-[20px]" />
          </Button>
        </CreateUpdateItem>
      </div>
      <TableView
        deleteUserInDB={deleteUserInDB}
        getItems={getItems}
        items={filteredItems}
        isLoading={isLoading}
      />
      <ListView
        getItems={getItems}
        deleteUserInDB={deleteUserInDB}
        items={filteredItems}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Items;
