import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  EstadoSolicitud,
  Solicitud,
  TipoSolicitud,
  SubtipoSivigila,
  SubtipoProtocolo,
} from "@/interfaces/solicitud.interface";
import { db, updateDocument } from "@/lib/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-user";
import { User } from "@/interfaces/user.interface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface CreateUpdateItemProps {
  children: React.ReactNode;
  itemToUpdate?: Solicitud;
  getItems: () => Promise<void>;
}

export function CreateUpdateItem({
  children,
  itemToUpdate,
  getItems,
}: CreateUpdateItemProps) {
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isOperarioDialogOpen, setIsOperarioDialogOpen] = useState(false);
  const [state, setState] = useState(
    itemToUpdate?.state || EstadoSolicitud.PENDIENTE
  );

  const formSchema = z.object({
    uid: z.string(),
    name: z
      .string()
      .min(2, { message: "Este campo es requerido, al menos 2 caracteres" }),
    description: z
      .string()
      .min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
    type: z.nativeEnum(TipoSolicitud, {
      message: "Seleccione un tipo de solicitud válido",
    }),
    subtype: z.string().nonempty({ message: "Seleccione un subtipo" }),
    state: z.nativeEnum(EstadoSolicitud),
    answer: z.string().optional(),
    answerAt: z.any().optional(),
    operario: z.any().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToUpdate || {
      uid: "",
      name: "",
      description: "",
      type: undefined,
      subtype: "",
      state: EstadoSolicitud.PENDIENTE,
    },
  });

  const { register, handleSubmit, formState, control, watch } = form;
  const { errors } = formState;

  const selectedType = watch("type");

  const onSubmit = async (item: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Si la solicitud tiene respuesta, cambia el estado a FINALIZADA y asigna answerAt
      if (
        itemToUpdate &&
        (user?.role === "REFERENTE" || user?.role === "ADMINISTRADOR") &&
        item.answer
      ) {
        item.state = EstadoSolicitud.FINALIZADA;
        item.answerAt = Timestamp.now(); // Agregar la marca de tiempo

        // Si el usuario es ADMINISTRADOR, asignar los datos del usuario al operario
        if (user?.role === "ADMINISTRADOR") {
          item.operario = user;
        }
      }

      if (itemToUpdate) {
        await updateSolicitudInDB(item as Solicitud);
      } else {
        await createSolicitudInDB(item as Solicitud);
      }

      getItems(); // Refresca la lista de solicitudes
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Ocurrió un error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSolicitudInDB = async (item: Solicitud) => {
    const path = "solicitudes/solicitudes";
    setIsLoading(true);

    try {
      // Asegúrate de que el campo `user` se conserve
      item.user = itemToUpdate?.user as User;

      // Elimina la versión anterior del array
      await updateDocument(path, {
        solicitudes: arrayRemove(itemToUpdate),
      });

      // Agrega la versión actualizada al array
      await updateDocument(path, {
        solicitudes: arrayUnion(item),
      });

      toast.success("Solicitud actualizada exitosamente", { duration: 2500 });
      getItems(); // Refresca la lista de solicitudes
      setIsDialogOpen(false);
      form.reset(); // Resetea el formulario
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error desconocido",
        { duration: 2500 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createSolicitudInDB = async (item: Solicitud) => {
    const path = `solicitudes/solicitudes`;
    setIsLoading(true);

    try {
      // Genera un UID único para la solicitud usando uuidv4
      item.uid = uuidv4();
      item.createdAt = Timestamp.now(); // Agrega un timestamp de creación
      item.user = user as User;
      item.state = EstadoSolicitud.PENDIENTE;

      // Referencia al documento único que contiene el array de usuarios
      const docRef = doc(db, path);

      // Verificar si el documento existe
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Si el documento existe, utiliza updateDocument para agregar al array existente
        await updateDocument(path, {
          solicitudes: arrayUnion(item),
        });
      } else {
        // Si el documento no existe, utiliza setDoc para crearlo y agregar el array de usuarios
        await setDoc(docRef, {
          solicitudes: [item], // Crea un array inicial con la primera solicitud
        });
      }

      toast.success("Solicitud creada exitosamente", { duration: 2500 });
      getItems(); // Refresca la lista de solicitudes
      setIsDialogOpen(false);
      form.reset(); // Resetea el formulario
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error desconocido",
        { duration: 2500 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {itemToUpdate && user?.role === "SOLICITANTE"
              ? "Editar Solicitud"
              : user?.role === "REFERENTE" ||
                (user?.role === "ADMINISTRADOR" && itemToUpdate)
              ? "Responder Solicitud"
              : "Crear Solicitud"}
          </DialogTitle>
          <DialogDescription>
            Gestiona la solicitud con la siguiente información.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-semibold">
                  <Badge>Solicitud</Badge>
                </AccordionTrigger>
                <AccordionContent>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                      {/* Nombre */}
                      <div className="mb-3">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          {...register("name")}
                          id="name"
                          placeholder="Nombre de la solicitud"
                          readOnly={user?.role === "REFERENTE"} // Solo lectura
                        />
                        {errors.name && (
                          <p className="form-error">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Descripción */}
                      <div className="mb-3">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          {...register("description")}
                          id="description"
                          placeholder="Descripción de la solicitud"
                          readOnly={user?.role === "REFERENTE"} // Solo lectura
                        />
                        {errors.description && (
                          <p className="form-error">
                            {errors.description.message}
                          </p>
                        )}
                      </div>

                      {/* Tipo */}
                      <div className="mb-3">
                        <Controller
                          name="type"
                          control={control}
                          render={({ field }) => (
                            <Select
                              onValueChange={(value) => field.onChange(value)}
                              value={field.value}
                              disabled={user?.role === "OPERARIO"} // Solo lectura
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tipo de solicitud" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value={TipoSolicitud.SIVIGILA}>
                                    SIVIGILA
                                  </SelectItem>
                                  <SelectItem value={TipoSolicitud.PROTOCOLO}>
                                    PROTOCOLO
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.type && (
                          <p className="form-error">{errors.type.message}</p>
                        )}
                      </div>

                      {/* Subtipo Condicional */}
                      {selectedType && (
                        <div className="mb-3">
                          <Controller
                            name="subtype"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) => field.onChange(value)}
                                value={field.value}
                                disabled={user?.role === "REFERENTE"} // Solo lectura
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione un subtipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {selectedType ===
                                      TipoSolicitud.SIVIGILA && (
                                      <>
                                        <SelectItem
                                          value={SubtipoSivigila.SUBTIPO_1}
                                        >
                                          Sivigila 1
                                        </SelectItem>
                                        <SelectItem
                                          value={SubtipoSivigila.SUBTIPO_2}
                                        >
                                          Sivigila 2
                                        </SelectItem>
                                      </>
                                    )}
                                    {selectedType ===
                                      TipoSolicitud.PROTOCOLO && (
                                      <>
                                        <SelectItem
                                          value={SubtipoProtocolo.SUBTIPO_A}
                                        >
                                          Protocolo 1
                                        </SelectItem>
                                        <SelectItem
                                          value={SubtipoProtocolo.SUBTIPO_B}
                                        >
                                          Protocolo 2
                                        </SelectItem>
                                      </>
                                    )}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.subtype && (
                            <p className="form-error">
                              {errors.subtype.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Estado */}
                      {/* {user?.role === "ADMINISTRADOR" && (
                        <div className="mb-3">
                          <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(value) => field.onChange(value)}
                                value={field.value}
                                disabled={user?.role === "OPERARIO"} // Deshabilitar si es OPERARIO
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccione el estado de la solicitud" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem
                                      value={EstadoSolicitud.PENDIENTE}
                                    >
                                      Pendiente
                                    </SelectItem>
                                    <SelectItem
                                      value={EstadoSolicitud.ASIGNADA}
                                    >
                                      Asignada
                                    </SelectItem>
                                    <SelectItem
                                      value={EstadoSolicitud.FINALIZADA}
                                    >
                                      Finalizada
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.state && (
                            <p className="form-error">{errors.state.message}</p>
                          )}
                        </div>
                      )} */}

                      {/* Answer (Solo para Edición y Roles Permitidos) */}
                      {itemToUpdate &&
                        (user?.role === "REFERENTE" ||
                          user?.role === "ADMINISTRADOR") && (
                          <div className="mb-3">
                            <Label htmlFor="answer">Respuesta</Label>
                            <Textarea
                              {...register("answer")}
                              id="answer"
                              placeholder="Ingresa tu respuesta"
                              readOnly={false} // Editable
                            />
                            {errors.answer && (
                              <p className="form-error">
                                {errors.answer.message}
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                    <DialogFooter>
                      {(itemToUpdate?.answer === "" &&
                        user?.role === "REFERENTE") ||
                        ((user?.role === "ADMINISTRADOR" ||
                          user?.role === "SOLICITANTE") && (
                          <Button type="submit">
                            {isLoading && (
                              <LoaderCircle className="mr-2 h-4 animate-spin" />
                            )}
                            {itemToUpdate && user?.role === "SOLICITANTE"
                              ? "Actualizar"
                              : user?.role === "REFERENTE" ||
                                user?.role === "ADMINISTRADOR"
                              ? "Responder"
                              : "Crear"}
                          </Button>
                        ))}
                    </DialogFooter>
                  </form>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        {itemToUpdate &&
          (user?.role === "ADMINISTRADOR" || user?.role === "REFERENTE") && (
            <Card>
              <CardContent>
                <Badge className="mb-2 mt-2">Usuario</Badge>
                <div className="flex flex-col">
                  <Button
                    variant="outline"
                    onClick={() => setIsUserDialogOpen(true)}
                  >
                    Ver Información de Usuario
                  </Button>
                  <Dialog
                    open={isUserDialogOpen}
                    onOpenChange={setIsUserDialogOpen}
                  >
                    <DialogContent>
                      <DialogContent className="space-y-2">
                        <DialogHeader>
                          <DialogTitle>Información del Usuario</DialogTitle>
                          <DialogDescription>
                            Datos del usuario asociado con esta solicitud.
                          </DialogDescription>
                        </DialogHeader>
                        {itemToUpdate.user.image && (
                          <Image
                            src={itemToUpdate.user.image.url}
                            alt="user-img"
                            width={1000}
                            height={1000}
                            className="object-cover w-32 h-32 rounded-full m-auto"
                          />
                        )}
                        <p>
                          <strong>Nombre:</strong>{" "}
                          {itemToUpdate?.user?.name || "No disponible"}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          {itemToUpdate?.user?.email || "No disponible"}
                        </p>
                        <p>
                          <strong>Unidad:</strong>{" "}
                          {itemToUpdate?.user?.unit.nombre || "No disponible"}
                        </p>
                        <p>
                          <strong>Rol:</strong>{" "}
                          {itemToUpdate?.user?.role || "No disponible"}
                        </p>
                      </DialogContent>

                      <DialogFooter>
                        <Button onClick={() => setIsUserDialogOpen(false)}>
                          Cerrar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}

        {itemToUpdate &&
          itemToUpdate.state === "asignada" &&
          user?.role !== "REFERENTE" &&
          itemToUpdate.operario && (
            <Card>
              <CardContent>
                <Badge className="mb-2 mt-2">Operario</Badge>
                <div className="flex flex-col">
                  <Button
                    variant="outline"
                    onClick={() => setIsOperarioDialogOpen(true)}
                  >
                    Ver Información del Operario
                  </Button>
                  <Dialog
                    open={isOperarioDialogOpen}
                    onOpenChange={setIsOperarioDialogOpen}
                  >
                    <DialogContent className="space-y-2">
                      <DialogHeader>
                        <DialogTitle>Información del Operario</DialogTitle>
                        <DialogDescription>
                          Datos del operario asignado a esta solicitud.
                        </DialogDescription>
                      </DialogHeader>
                      {itemToUpdate.user.image && (
                        <Image
                          src={itemToUpdate.operario.image.url}
                          alt="user-img"
                          width={1000}
                          height={1000}
                          className="object-cover w-32 h-32 rounded-full m-auto"
                        />
                      )}
                      <p>
                        <strong>Nombre:</strong>{" "}
                        {itemToUpdate?.operario?.name || "No disponible"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {itemToUpdate?.operario?.email || "No disponible"}
                      </p>
                      <p>
                        <strong>Unidad:</strong>{" "}
                        {itemToUpdate?.operario?.unit.tipo || "No disponible"}
                        {itemToUpdate?.operario?.unit.nombre || "No disponible"}
                      </p>
                      <p>
                        <strong>Rol:</strong>{" "}
                        {itemToUpdate?.operario?.role || "No disponible"}
                      </p>

                      <DialogFooter>
                        <Button onClick={() => setIsOperarioDialogOpen(false)}>
                          Cerrar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          )}
      </DialogContent>
    </Dialog>
  );
}
