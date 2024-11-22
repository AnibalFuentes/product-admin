import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User } from "@/interfaces/user.interface"; // Cambia la interfaz a User
import { Solicitud } from "../../../../interfaces/solicitud.interface";

interface ConfirmDeletionProps {
  children: React.ReactNode;
  deleteUserInDB: (item: Solicitud) => Promise<void>; // Cambia la función a deleteUserInDB
  item: Solicitud; // Cambia el tipo de item a User
}

export function ConfirmDeletion({
  children,
  deleteUserInDB,
  item,
}: ConfirmDeletionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de eliminar este SOLICITANTE?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el
            usuario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-blue-400">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteUserInDB(item)} // Cambia la función a deleteUserInDB
            className="bg-red-900 hover:bg-red-600 hover:animate-none animate-pulse"
          >
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
