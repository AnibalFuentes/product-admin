import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useUser } from '@/hooks/use-user'
import { SwitchStateItem } from './switch-state-item'
import { User } from '@/interfaces/user.interface'
import { ItemImage } from '@/interfaces/item-image.interface'
import DragAndDropImage from '@/components/drag-and-drop-image'
import { createUser, signOutAccount, updateDocument, uploadBase64 } from '@/lib/firebase'
import { arrayRemove, arrayUnion } from 'firebase/firestore'

interface CreateUpdateItemProps {
  children: React.ReactNode
  itemToUpdate?: User
  getItems: () => Promise<void>
}

export function CreateUpdateItem({
  children,
  itemToUpdate,
  getItems
}: CreateUpdateItemProps) {
  const user = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [image, setImage] = useState('')
  const [state, setState] = useState(itemToUpdate?.state || false)

  const formSchema = z.object({
    uid: z.string(),
    image: z.object({
      path: z.string(),
      url: z.string()
    }),
    name: z.string().min(2, { message: 'Este campo es requerido, al menos 2 caracteres' }),
    email: z.string().email('El formato del email no es válido. Ejemplo: user@mail.com'),
    password: z.string().min(6, { message: 'La contraseña debe contener al menos 6 caracteres' }).optional(),
    phone: z.string().min(10, { message: 'Debe ingresar un número de teléfono válido' }), // Validación del teléfono
    unit: z.enum(['UI', 'UPGD'], { message: 'Seleccione una unidad válida' }), // Validación del campo unidad
    role: z.enum(['ADMIN', 'OPERARIO', 'USUARIO'], { message: 'Seleccione un rol válido' }), // Validación del campo rol
    state: z.boolean()
  });
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToUpdate || {
      uid: '',
      image: {} as ItemImage,
      name: '',
      email: '',
      password: '',
      state: true
    }
  })

  const { register, handleSubmit, formState, setValue } = form
  const { errors } = formState

  const handleImage = (url: string) => {
    const path = itemToUpdate ? itemToUpdate.image.path : `${user?.uid}/${Date.now()}`
    setValue('image', { url, path })
    setImage(url)
  }

  useEffect(() => {
    if (itemToUpdate) {
      setImage(itemToUpdate.image.url)
      setState(itemToUpdate.state)
    }
  }, [itemToUpdate])

  

  const updateCategoryInDB = async (item: User) => {
    const path = `usuarios/users`
    setIsLoading(true)
    try {
      // Si la imagen ha cambiado, sube la nueva imagen
      if (itemToUpdate?.image.url !== item.image.url) {
        const base64 = item.image.url
        const imagePath = item.image.path || `${itemToUpdate?.uid}/${Date.now()}`
        const imageUrl = await uploadBase64(imagePath, base64)
        item.image.url = imageUrl
      }
  
      // Remover el item original
      await updateDocument(path, {
        users: arrayRemove(itemToUpdate) // Elimina el elemento existente
      })
  
      // Agregar el item actualizado
      await updateDocument(path, {
        users: arrayUnion(item) // Agrega el nuevo elemento
      })
  
      toast.success('Usuario Actualizado Exitosamente', { duration: 2500 })
      getItems()
      setIsDialogOpen(false)
      form.reset()
      setImage('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 })
      } else {
        toast.error('Ocurrió un error desconocido', { duration: 2500 })
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const onSubmit = (item: z.infer<typeof formSchema>) => {
    item.state = state;
  
    if (itemToUpdate) {
      // Al actualizar, omitimos el campo password al enviar, ya que no está siendo usado
      const { password, ...itemWithoutPassword } = item;
      updateCategoryInDB(itemWithoutPassword as User);
    } else {
      // Al crear, incluimos la contraseña
      createCategoryInDB(item as User);
    }
  };
  
  const createCategoryInDB = async (item: User) => {
    const path = `usuarios/users`;
    setIsLoading(true);
    try {
      // Crear usuario en Firebase Auth utilizando la función createUser
      const userCredential = await createUser({
        email: item.email,
        password: item.password!, // Aquí debe estar la contraseña
      });
  
      const userId = userCredential.user.uid; // Obtener el UID del usuario creado
  
      // Subir la imagen si es necesario
      const base64 = item.image.url;
      const imagePath = item.image.path || `${userId}/${Date.now()}`;
      const imageUrl = await uploadBase64(imagePath, base64);
  
      // Actualizar la URL de la imagen y agregar el UID al objeto item, eliminando la contraseña
      item.image.url = imageUrl;
      item.uid = userId;
      delete item.password; // Eliminar la contraseña para evitar enviarla a Firestore
  
      // Agregar el usuario al array users en Firestore
      await updateDocument(path, {
        users: arrayUnion(item), // Usa arrayUnion para agregar al array
      });
  
      toast.success("Usuario Creado Exitosamente", { duration: 2500 });
      getItems();
      setIsDialogOpen(false);
      form.reset();
      setImage("");
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
  

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{itemToUpdate ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
          <DialogDescription>
            Gestiona tu usuario con la siguiente información.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            {/* Imagen */}
            <div className="mb-3">
              <Label htmlFor="image">Imagen</Label>
              {image ? (
                <div className="text-center">
                  <Image
                    width={1000}
                    height={1000}
                    src={image}
                    alt="user-image"
                    className="w-[50%] m-auto"
                  />
                  <Button
                    className="mt-3"
                    variant="destructive"
                    type="button"
                    onClick={() => handleImage("")}
                    disabled={isLoading}
                  >
                    Remover Imagen
                  </Button>
                </div>
              ) : (
                <DragAndDropImage handleImage={handleImage} />
              )}
            </div>
            {/* Nombre */}
            <div className="mb-3">
              <Label htmlFor="name">Nombre</Label>
              <Input {...register("name")} id="name" placeholder="Nombre" />
              <p className="form-error">{errors.name?.message}</p>
            </div>
            {/* Email */}
            <div className="mb-3">
              <Label htmlFor="email">Email</Label>
              <Input {...register("email")} id="email" placeholder="Correo Electrónico" />
              <p className="form-error">{errors.email?.message}</p>
            </div>
            {/* Teléfono */}
            <div className="mb-3">
              <Label htmlFor="phone">Teléfono</Label>
              <Input {...register("phone")} id="phone" placeholder="Teléfono" />
              <p className="form-error">{errors.phone?.message}</p>
            </div>
            {/* Unidad */}
            <div className="mb-3">
              <Label htmlFor="unit">Unidad</Label>
              <select {...register("unit")} id="unit" className="w-full border p-2 rounded">
                <option value="">Seleccione una unidad</option>
                <option value="UI">UI</option>
                <option value="UPGD">UPGD</option>
              </select>
              <p className="form-error">{errors.unit?.message}</p>
            </div>
            {/* Rol */}
            <div className="mb-3">
              <Label htmlFor="role">Rol</Label>
              <select {...register("role")} id="role" className="w-full border p-2 rounded">
                <option value="">Seleccione un rol</option>
                <option value="ADMIN">ADMIN</option>
                <option value="OPERARIO">OPERARIO</option>
                <option value="USUARIO">USUARIO</option>
              </select>
              <p className="form-error">{errors.role?.message}</p>
            </div>
            {/* Contraseña */}
            {!itemToUpdate && (
              <div className="mb-3">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  {...register("password")}
                  id="password"
                  placeholder="Contraseña"
                  type="password"
                />
                <p className="form-error">{errors.password?.message}</p>
              </div>
            )}
            {/* Estado */}
            {itemToUpdate && (
              <div className="mb-3">
                <SwitchStateItem checked={state} onChange={setState} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => signOutAccount()}></Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <LoaderCircle className='mr-2 h-4 animate-spin' />}
              {itemToUpdate ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
  
}
