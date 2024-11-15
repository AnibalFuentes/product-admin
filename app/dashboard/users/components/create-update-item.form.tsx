import { Button } from '@/components/ui/button'
import { User as FirebaseUser, signOut } from 'firebase/auth'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle, Trash2 } from 'lucide-react'
import Image from 'next/image'
import * as z from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useUser } from '@/hooks/use-user'
import { SwitchStateItem } from './switch-state-item'
import { User } from '@/interfaces/user.interface'
import { ItemImage } from '@/interfaces/item-image.interface'
import DragAndDropImage from '@/components/drag-and-drop-image'
import { createUser, db, SignIn, signOutAccount, updateDocument, uploadBase64 } from '@/lib/firebase'
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { getAuth, sendEmailVerification } from 'firebase/auth'
import { DropdownMenuDemo } from './dropdownVerification';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_USER_IMAGE_URL } from '@/constants/constants';

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
  const [canResend, setCanResend] = useState(true)
  const [edit, setEdit] = useState<boolean>(false)


  const formSchema = z.object({
    uid: z.string(),
    image: z.object({
      path: z.string(),
      url: z.string()
    }),
    name: z.string().min(2, { message: 'Este campo es requerido, al menos 2 caracteres' }),
    email: z.string().email('El formato del email no es válido. Ejemplo: user@mail.com'),
    password: z.string().min(6, { message: 'La contraseña debe contener al menos 6 caracteres' }).optional(),
    phone: z.string().min(10, { message: 'Debe ingresar un número de teléfono válido' }),
    unit: z.enum(['UI', 'UPGD'], { message: 'Seleccione una unidad válida' }),
    role: z.enum(['ADMIN', 'OPERARIO', 'USUARIO'], { message: 'Seleccione un rol válido' }),
    state: z.boolean()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToUpdate || {
      uid: '',
      image: {
        path:'defaultImages',
        url:'https://firebasestorage.googleapis.com/v0/b/happy-cream.appspot.com/o/defaultImages%2Fusuario.jpeg?alt=media&token=b0e2e7f4-dc3e-49dd-9b4e-24c74c9d2d57'
      } as ItemImage,
      name: '',
      email: '',
      password: '',
      phone: '',
      state: true
    }
  })

  const { register, handleSubmit, formState, setValue, control } = form
  const { errors } = formState

  
  useEffect(() => {
    if (itemToUpdate) {
      setImage(itemToUpdate.image.url)
      setState(itemToUpdate.state)
    }
  }, [itemToUpdate])
  
   const sendVerificationEmail = async (currentUser: FirebaseUser) => {
    try {
      await sendEmailVerification(currentUser);
      toast.success("Correo de verificación enviado");
      setCanResend(false);
      setTimeout(() => setCanResend(true), 60000); // Permitir reenvío después de 1 minuto
    } catch (error) {
      const err = error as Error;
      toast.error(`Error al enviar verificación: ${err.message}`);
    }
  };
  
  const handleSendVerificationEmail = () => {
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      sendVerificationEmail(currentUser);
    } else {
      toast.error("No hay un usuario autenticado para enviar la verificación.");
    }
  };
  const handleImage = (url: string) => {
    const path = itemToUpdate ? itemToUpdate.image.path : `${user?.uid}/${Date.now()}`
    setValue('image', { url, path })
    setImage(url)
  }
  
  const updateCategoryInDB = async (item: User) => {
    const path = 'usuarios/users';
    setIsLoading(true);
    const defaultImageUrl = DEFAULT_USER_IMAGE_URL
    try {
      // Actualiza la imagen solo si no es la imagen por defecto
      if (itemToUpdate?.image.url !== defaultImageUrl && itemToUpdate?.image.url !== item.image.url) {
        const base64 = item.image.url;
        const imagePath = item.image.path || `${itemToUpdate?.uid}/${Date.now()}`;
        const imageUrl = await uploadBase64(imagePath, base64);
        item.image.url = imageUrl;
      }
  
      await updateDocument(path, {
        users: arrayRemove(itemToUpdate)
      });
  
      await updateDocument(path, {
        users: arrayUnion(item)
      });
  
      toast.success('Usuario Actualizado Exitosamente', { duration: 2500 });
      getItems();
      setIsDialogOpen(false);
      form.reset();
      setImage('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error desconocido', { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };
  

  const onSubmit = (item: z.infer<typeof formSchema>) => {
    item.state = state;

    if (itemToUpdate) {
      const { password, ...itemWithoutPassword } = item;
      updateCategoryInDB(itemWithoutPassword as User);
    } else {
      createUserInDB(item as User);
    }
    
  };

  const createUserInDB = async (item: User) => {
    const path = `usuarios/users`;
    setIsLoading(true);
  
    try {
      // Crea el usuario en Firebase Authentication
      const userCredential = await createUser({
        email: item.email,
        password: item.password!
      });
      const userId = userCredential.user.uid;
  
      // Verificar si la imagen no es la predeterminada antes de intentar subirla
      if (item.image.url !== DEFAULT_USER_IMAGE_URL) {
        const base64 = item.image.url;
        const imagePath = item.image.path || `${userId}/${Timestamp.now()}`;
        const imageUrl = await uploadBase64(imagePath, base64);
        item.image.url = imageUrl;
      }
  
      // Asigna el UID, elimina la contraseña y agrega la fecha de creación
      item.uid = userId;
      delete item.password;
      item.createdAt = Timestamp.now();
  
      // Referencia al documento único en Firestore
      const docRef = doc(db, path);
  
      // Verificar si el documento ya existe en Firestore
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        // Si el documento existe, usa updateDocument para agregar el usuario al array `users`
        await updateDocument(path, {
          users: arrayUnion(item)
        });
      } else {
        // Si el documento no existe, usa setDoc para crearlo con un array inicial que contenga el usuario
        await setDoc(docRef, {
          users: [item] // Crea el array `users` con el primer usuario
        });
      }
  
      // Enviar correo de verificación
      await sendVerificationEmail(userCredential.user);
      toast.success("Usuario Creado Exitosamente", { duration: 2500 });
      getItems(); // Refresca la lista de usuarios
      setIsDialogOpen(false);
      form.reset(); // Resetea el formulario
      setImage(""); // Resetea la imagen
  
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error desconocido", { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open ) {
        form.reset(); // Limpia el formulario al cerrar el diálogo cuando es un nuevo usuario
        if(itemToUpdate){
          setImage(itemToUpdate.image.url)
        }else{
          setImage('')

        }
        setEdit(false); // Resetea el estado de edición
      }
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle><div className='flex items-center'><DropdownMenuDemo onResendVerification={handleSendVerificationEmail} getItems={getItems} itemToUpdate={itemToUpdate} /> {itemToUpdate?'Editar Usuario':'Crear Usuario'}</div></DialogTitle>
          <DialogDescription>
            Gestiona tu usuario con la siguiente información.
          </DialogDescription>
          {itemToUpdate&&<div className='flex items-center space-x-2'>
      <Switch id='state' checked={edit} onCheckedChange={setEdit} />
      <Label htmlFor='state'>Actualizar</Label>
    </div>}
          
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            {/* Imagen */}
            <div className="mb-3">
              {/* <Label htmlFor="image">Imagen</Label> */}
              {image ? (
                <div className="text-center">
                  <Image
                    width={1000}
                    height={1000}
                    src={image}
                    alt="user-image"
                    className="object-cover w-32 h-32 rounded-full m-auto"
                  />
                  <Button
                    className="mt-3"
                    variant="destructive"
                    type="button"
                    onClick={() => handleImage("")}
                    disabled={isLoading || (!Boolean(edit) && Boolean(itemToUpdate))}


                  >
                    <Trash2/>
                  </Button>
                </div>
              ) : (
                <DragAndDropImage handleImage={handleImage} />
              )}
            </div>
            {/* Nombre */}
            <div className="mb-3">
              <Label htmlFor="name">Nombre</Label>
              <Input {...register("name")} id="name" placeholder="Nombre" readOnly={!edit&&Boolean(itemToUpdate)}/>
              <p className="form-error">{errors.name?.message}</p>
            </div>
            {/* Email */}
            
            <div className="mb-3" >
              <Label htmlFor="email">Email</Label>
              <Input {...register("email")} id="email" placeholder="Correo Electrónico" readOnly={itemToUpdate?true:false}/>
              <p className="form-error">{errors.email?.message}</p>
            </div>
            {/* Teléfono */}
            <div className="mb-3">
              <Label htmlFor="phone">Teléfono</Label>
              <Input {...register("phone")} id="phone" placeholder="Teléfono" readOnly={!edit&&Boolean(itemToUpdate)}/>
              <p className="form-error">{errors.phone?.message}</p>
            </div>
            {/* Unidad */}
            <div className="mb-3">
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)} value={field.value} disabled={!edit&&Boolean(itemToUpdate)}>
                    <SelectTrigger className="w-[180px]" >
                      <SelectValue placeholder="Seleccione una unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="UPGD">UPGD</SelectItem>
                        <SelectItem value="UI">UI</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="form-error">{errors.unit?.message}</p>
            </div>
            {/* Rol */}
            <div className="mb-3">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value)} value={field.value} disabled={!edit&&Boolean(itemToUpdate)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="OPERARIO">OPERARIO</SelectItem>
                        <SelectItem value="USUARIO">USUARIO</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
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
                  disabled={!edit&&Boolean(itemToUpdate)}
                />
                <p className="form-error">{errors.password?.message}</p>
              </div>
            )}
            {/* Estado */}
            {itemToUpdate && (
              <div className="mb-3">
                 <div className='flex items-center space-x-2'>
      <Switch id='state' checked={state} onCheckedChange={setState} disabled={!edit} />
      <Label htmlFor='state'>Estado</Label>
    </div>
              </div>
            )}
          </div>
          <DialogFooter>
            
            <Button type='submit' disabled={isLoading||!edit&&Boolean(itemToUpdate)}>
              {isLoading && <LoaderCircle className='mr-2 h-4 animate-spin' />}
              {itemToUpdate ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
