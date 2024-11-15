import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EstadoSolicitud, Solicitud, TipoSolicitud, SubtipoSivigila, SubtipoProtocolo } from '@/interfaces/solicitud.interface';
import { db, updateDocument } from '@/lib/firebase';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

interface CreateUpdateItemProps {
  children: React.ReactNode;
  itemToUpdate?: Solicitud;
  getItems: () => Promise<void>
}

export function CreateUpdateItem({
  children,
  itemToUpdate,
  getItems
}: CreateUpdateItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [state, setState] = useState(itemToUpdate?.state || EstadoSolicitud.PENDIENTE);

  const formSchema = z.object({
    uid: z.string(),
    name: z.string().min(2, { message: 'Este campo es requerido, al menos 2 caracteres' }),
    description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres' }),
    type: z.nativeEnum(TipoSolicitud, { message: 'Seleccione un tipo de solicitud válido' }),
    subtype: z.string().nonempty({ message: 'Seleccione un subtipo' }),
    state: z.nativeEnum(EstadoSolicitud)
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToUpdate || {
      uid: '',
      name: '',
      description: '',
      type: undefined,
      subtype: '',
      state: EstadoSolicitud.PENDIENTE
    },
    mode: "onChange" // Enables form validation on each input change
  });

  const { register, handleSubmit, formState, setValue, control, watch } = form;
  const { errors } = formState;

  const selectedType = watch("type");

  useEffect(() => {
    if (itemToUpdate) {
      setState(itemToUpdate.state);
    }
  }, [itemToUpdate]);

  const onSubmit = async (item: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (itemToUpdate) {
        await updateSolicitudInDB(itemToUpdate);
      } else {
        await createSolicitudInDB(item as Solicitud);
      }
      toast.success('Solicitud procesada exitosamente');
      getItems();
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error('Ocurrió un error al procesar la solicitud');
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
  
      // Referencia al documento único que contiene el array de usuarios
      const docRef = doc(db, path);
  
      // Verificar si el documento existe
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Si el documento existe, utiliza updateDocument para agregar al array existente
        await updateDocument(path, {
          solicitudes: arrayUnion(item)
        });
      } else {
        // Si el documento no existe, utiliza setDoc para crearlo y agregar el array de usuarios
        await setDoc(docRef, {
          solicitudes: [item] // Crea un array inicial con la primera solicitud
        });
      }
  
      toast.success("Solicitud creada exitosamente", { duration: 2500 });
      getItems(); // Refresca la lista de solicitudes
      setIsDialogOpen(false);
      form.reset(); // Resetea el formulario
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error desconocido", { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSolicitudInDB = async (item: Solicitud) => {
     const path = `solicitudes/solicitudes`
    setIsLoading(true)
    try {
     
      await updateDocument(path, {
        users: arrayRemove(itemToUpdate)
      })

      await updateDocument(path, {
        users: arrayUnion(item)
      })

      toast.success('Solicitud Actualizada Exitosamente', { duration: 2500 })
      getItems()
      setIsDialogOpen(false)
      form.reset()
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error desconocido', { duration: 2500 })
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{itemToUpdate ? 'Editar Solicitud' : 'Crear Solicitud'}</DialogTitle>
          <DialogDescription>Gestiona la solicitud con la siguiente información.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            {/* Name */}
            <div className="mb-3">
              <Label htmlFor="name">Nombre</Label>
              <Input {...register("name")} id="name" placeholder="Nombre de la solicitud" />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="mb-3">
              <Label htmlFor="description">Descripción</Label>
              <Input {...register("description")} id="description" placeholder="Descripción de la solicitud" />
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>

            {/* Type */}
            <div className="mb-3">
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo de solicitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={TipoSolicitud.SIVIGILA}>SIVIGILA</SelectItem>
                        <SelectItem value={TipoSolicitud.PROTOCOLO}>PROTOCOLO</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="form-error">{errors.type.message}</p>}
            </div>

            {/* Conditional Subtype (only displayed if a type is selected) */}
            {selectedType && (
              <div className="mb-3">
                <Controller
                  name="subtype"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un subtipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {selectedType === TipoSolicitud.SIVIGILA && (
                            <>
                              <SelectItem value={SubtipoSivigila.SUBTIPO_1}>Sivigila 1</SelectItem>
                              <SelectItem value={SubtipoSivigila.SUBTIPO_2}>Sivigila 2</SelectItem>
                            </>
                          )}
                          {selectedType === TipoSolicitud.PROTOCOLO && (
                            <>
                              <SelectItem value={SubtipoProtocolo.SUBTIPO_A}>Protocolo A</SelectItem>
                              <SelectItem value={SubtipoProtocolo.SUBTIPO_B}>Protocolo B</SelectItem>
                            </>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subtype && <p className="form-error">{errors.subtype.message}</p>}
              </div>
            )}

            {/* Estado */}
            <div className="mb-3">
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el estado de la solicitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={EstadoSolicitud.PENDIENTE}>Pendiente</SelectItem>
                        <SelectItem value={EstadoSolicitud.ASIGNADA}>Asignada</SelectItem>
                        <SelectItem value={EstadoSolicitud.FINALIZADA}>Finalizada</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && <p className="form-error">{errors.state.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {isLoading && <LoaderCircle className="mr-2 h-4 animate-spin" />}
              {itemToUpdate ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
