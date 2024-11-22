import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import * as XLSX from "xlsx"; // Importamos xlsx para manejar archivos Excel
import { User } from "@/interfaces/user.interface";
import { EllipsisIcon, Mail, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Importa el componente de tabla
import { createUser, db, signOutAccount, updateDocument } from "@/lib/firebase";
import { arrayUnion, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { User as FirebaseUser, sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";
import { DEFAULT_USER_IMAGE_URL } from "@/constants/constants";

interface DropdownMenuDemoProps {
  onResendVerification: () => void;
  itemToUpdate?: User;
  getItems: () => Promise<void>;
}

export function DropdownMenuDemo({
  onResendVerification,
  itemToUpdate,
  getItems,
}: DropdownMenuDemoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [usersFromExcel, setUsersFromExcel] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Función para manejar la carga de archivos Excel
  // URL de la imagen predeterminada en Firebase
  const defaultImageUrl = DEFAULT_USER_IMAGE_URL;

  // Función para manejar la carga de archivos Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

        // Verificar si el encabezado es correcto
        const [headers, ...rows] = jsonData;
        if (
          headers[0] !== "correo" ||
          headers[1] !== "nombres" ||
          headers[2] !== "telefono" ||
          headers[3] !== "unidad" ||
          headers[4] !== "rol"
        ) {
          setErrorMessage(
            "El archivo debe tener encabezados 'correo', 'nombres', 'telefono', 'unidad', y 'rol'."
          );
          setUsersFromExcel([]);
          return;
        }

        // Agregar la columna 'Resultado' al encabezado
        headers.push("Resultado");

        // Procesar los datos si el encabezado es correcto
        const validUsers = rows.map((row: any[]) => ({
          email: row[0] as string,
          name: row[1] as string,
          phone: row[2] as string,
          unit: row[3] as "UI" | "UPGD",
          role: row[4] as "ADMINISTRADOR" | "REFERENTE" | "SOLICITANTE",
          state: true,
          image: {
            url: defaultImageUrl,
            path: "defaultImages/usuario.jpeg",
          },
          Resultado: "", // Agregar un campo 'Resultado' vacío que se actualizará después
        }));

        setErrorMessage(null);
        setUsersFromExcel([headers, ...validUsers]); // Guardar el encabezado y los usuarios
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const createUsersFromExcel = async () => {
    setIsLoading(true);
    const updatedUsers = [...usersFromExcel]; // Crear una copia para actualizar los resultados

    try {
      const count = 0;
      for (let i = 1; i < updatedUsers.length; i++) {
        const item = updatedUsers[i];
        const path = `usuarios/users`;

        try {
          // Crear usuario en Firebase Authentication
          const userCredential = await createUser({
            email: item.email,
            password: "Anibal",
          });
          const userId = userCredential.user.uid;

          // Asigna UID y fecha de creación
          item.uid = userId;
          item.createdAt = Timestamp.now();

          const docRef = doc(db, path);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            await updateDocument(path, {
              users: arrayUnion(item),
            });
          } else {
            await setDoc(docRef, {
              users: [item],
            });
          }

          // Enviar correo de verificación
          await sendVerificationEmail(userCredential.user);

          // Actualizar el campo 'Resultado' a "Exitoso"
          (updatedUsers[i] as any).Resultado = "Exitoso";
        } catch (error) {
          (updatedUsers[i] as any).Resultado = `Fallido: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`;
        }
      }

      // Crear el archivo Excel actualizado usando los datos originales con la columna de resultado
      const worksheet = XLSX.utils.json_to_sheet(updatedUsers, {
        skipHeader: true,
      });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Resultados");
      XLSX.writeFile(workbook, "ReporteUsuarios.xlsx");

      toast.success("Usuarios procesados y reporte generado exitosamente", {
        duration: 3000,
      });
      await signOutAccount();
      getItems();
      setIsDialogOpen(false);
      setUsersFromExcel([]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error desconocido",
        { duration: 2500 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (currentUser: FirebaseUser) => {
    try {
      await sendEmailVerification(currentUser);
      console.log("Correo de verificación enviado");
    } catch (error) {
      const err = error as Error;
      console.log(`Error al enviar verificación: ${err.message}`);
    }
  };

  const handleCreateUsers = async () => {
    createUsersFromExcel();
    setIsDialogOpen(false); // Cerrar el diálogo después de crear los usuarios
  };
  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setUsersFromExcel([]);
      setErrorMessage(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span className="cursor-pointer">
          <EllipsisIcon className="w-7 h-7 hover:bg-gray-200 rounded-full" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {itemToUpdate && (
            <DropdownMenuItem
              onClick={onResendVerification}
              className="cursor-pointer"
            >
              <Mail />
              <span>Reenviar verificación</span>
            </DropdownMenuItem>
          )}
          {!itemToUpdate && (
            <DropdownMenuItem
              onClick={() => setIsDialogOpen(true)}
              className="cursor-pointer"
            >
              <Users />
              <span>Crear usuarios desde Excel</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>

      {/* Dialog para cargar el archivo Excel */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[700px] w-full max-w-[90vw] overflow-x-auto">
          <DialogHeader>
            <DialogTitle>Cargar Usuarios desde Excel</DialogTitle>
            <DialogDescription>
              Sube un archivo Excel con el formato adecuado.
            </DialogDescription>
          </DialogHeader>
          <Input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {usersFromExcel.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Usuarios Cargados:</h3>
              <div className="overflow-x-auto">
                <Table className="min-w-[650px] mt-2 border border-gray-300 rounded-md overflow-hidden shadow-md">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="px-4 py-2 text-left text-gray-700 font-medium">
                        Correo
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left text-gray-700 font-medium">
                        Nombres
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left text-gray-700 font-medium">
                        Teléfono
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left text-gray-700 font-medium">
                        Unidad
                      </TableHead>
                      <TableHead className="px-4 py-2 text-left text-gray-700 font-medium">
                        Rol
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersFromExcel.map((user, index) => (
                      <TableRow
                        key={index}
                        className="border-t hover:bg-gray-50"
                      >
                        <TableCell className="px-4 py-2 text-gray-800">
                          {user.email}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-gray-800">
                          {user.name}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-gray-800">
                          {user.phone}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-gray-800">
                          {user.unit.nombre}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-gray-800">
                          {user.role}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleCreateUsers}
              disabled={usersFromExcel.length === 0}
            >
              Crear Usuarios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
