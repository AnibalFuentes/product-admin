import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { User } from "@/interfaces/user.interface";
import {
  EstadoSolicitud,
  Solicitud,
} from "../../../../interfaces/solicitud.interface";
import { getDocument, updateDocument } from "@/lib/firebase";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";
import { Loader } from "lucide-react";
import { arrayRemove, arrayUnion, Timestamp } from "firebase/firestore";

interface AssingOpProps {
  children: React.ReactNode;
  item: Solicitud;
  getItems: () => Promise<void>;
}

export function AssingOp({ children, item, getItems }: AssingOpProps) {
  const { user } = useUser();
  const [operarios, setOperarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Obtener usuarios con rol OPERARIO
  const getOperarios = async () => {
    const path = `usuarios/users`;

    setIsLoading(true);
    try {
      const res = (await getDocument(path)) as { users: User[] };
      if (res && res.users) {
        // Filtrar usuarios cuyo rol sea 'OPERARIO'
        const filteredOperarios = res.users.filter(
          (user) => user.role === "OPERARIO"
        );
        setOperarios(filteredOperarios);
      } else {
        setOperarios([]);
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
  const AssingOperario = async (item: Solicitud, operario: User) => {
    const path = "solicitudes/solicitudes";
    setIsLoading(true);

    try {
      // Eliminar el objeto original antes de modificarlo
      await updateDocument(path, {
        solicitudes: arrayRemove(item),
      });

      // Modificar el objeto
      const updatedItem = {
        ...item,
        operario,
        assignedAt: Timestamp.now(),
        state: EstadoSolicitud.ASIGNADA,
      };

      // Agregar el objeto actualizado
      await updateDocument(path, {
        solicitudes: arrayUnion(updatedItem),
      });

      toast.success("Solicitud actualizada exitosamente", { duration: 2500 });
      await getItems(); // Refresca la lista de solicitudes
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error desconocido",
        { duration: 2500 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) getOperarios();
  }, [user]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Operario</DialogTitle>
          <DialogDescription>
            Aquí podrás asignar un Operario a esta Solicitud.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto grid grid-cols-1  gap-4">
          {isLoading ? (
            <Loader className="animate-spin mx-auto" />
          ) : operarios.length > 0 ? (
            operarios.map((operario) => (
              <Card key={operario.uid} className="shadow-md border">
                <CardHeader>
                  <CardTitle>{operario.name}</CardTitle>
                  <CardDescription>{operario.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Unidad: {operario.unit || "Sin unidad"}
                  </p>
                </CardContent>
                <CardFooter>
                  <button
                    className="mt-2 px-4 py-2  bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    onClick={() => AssingOperario(item, operario)}
                  >
                    Asignar
                  </button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center col-span-full">
              No se encontraron operarios disponibles.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
