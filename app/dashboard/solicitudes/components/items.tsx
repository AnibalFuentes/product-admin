"use client";

import { deleteImage, getDocument, updateDocument } from "@/lib/firebase";
import { CreateUpdateItem } from "./create-update-item.form";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { TableView } from "./table-view";
import toast from "react-hot-toast";
import { CirclePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListView from "./list-view";
import { arrayRemove } from "firebase/firestore";
import { Solicitud } from "@/interfaces/solicitud.interface";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

const Items = () => {
  const { user } = useUser();
  const [items, setItems] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Término de búsqueda

  const isMolbile = useIsMobile();

  //=========OBTENER SOLICITUDES DE FIRESTORE
  const getItems = async () => {
    const path = `solicitudes/solicitudes`;

    setIsLoading(true);
    try {
      const res = (await getDocument(path)) as { solicitudes: Solicitud[] };

      if (res && res.solicitudes) {
        let filteredSolicitudes: Solicitud[] = [];

        // Filtrar según el rol del usuario
        if (user?.role === "ADMIN") {
          filteredSolicitudes = res.solicitudes; // Admin ve todas las solicitudes
        } else if (user?.role === "USUARIO") {
          filteredSolicitudes = res.solicitudes.filter(
            (solicitud) => solicitud.user?.uid === user?.uid // Usuario ve sus propias solicitudes
          );
        } else if (user?.role === "OPERARIO") {
          filteredSolicitudes = res.solicitudes.filter(
            (solicitud) => solicitud.operario?.uid === user?.uid // Operario ve las asignadas a él
          );
        }

        setItems(filteredSolicitudes);
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

  //================ELIMINAR SOLICITUD DE FIRESTORE
  const deleteSolicitudInDB = async (item: Solicitud) => {
    const path = `solicitudes/solicitudes`;
    setIsLoading(true);
    try {
      await updateDocument(path, {
        solicitudes: arrayRemove(item),
      });

      toast.success("Solicitud Eliminada Exitosamente 🗑️", { duration: 2500 });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filtrar solicitudes en función del término de búsqueda para todos los campos
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
            placeholder="Buscar solicitudes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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

        {/* Botón de creación */}
        {user?.role === "ADMIN" && (
          <CreateUpdateItem getItems={getItems}>
            <Button className="">
              {!isMolbile && "Crear"}
              <CirclePlus className=" w-[20px]" />
            </Button>
          </CreateUpdateItem>
        )}
      </div>

      {/* Vista de Tabla y Lista */}
      <TableView
        deleteUserInDB={deleteSolicitudInDB}
        getItems={getItems}
        items={filteredItems}
        isLoading={isLoading}
      />
      <ListView
        getItems={getItems}
        deleteUserInDB={deleteSolicitudInDB}
        items={filteredItems}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Items;
