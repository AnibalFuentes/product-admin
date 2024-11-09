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
import { CirclePlus } from 'lucide-react'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createUser,
  setDocument,
  signOutAccount,
  updateUser
} from '@/lib/firebase'
import { useState } from 'react'
import { LoaderCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { User } from '@/interfaces/user.interface'

export function CreateUpdateItem () {
    const [isLoading, setIsLoading] = useState<boolean>(false)
  

  const formSchema = z
    .object({
      uid: z.string(),
      name: z
        .string()
        .min(2, { message: 'Este campo es requerido, al menos 2 caracteres' }),
      email: z
        .string()
        .email('El formato del email no es válido. Ejemplo: user@mail.com')
        .min(1, { message: 'Este campo es requerido' }),
      password: z.string().min(6, {
        message: 'La contraseña debe contener al menos 6 caracteres'
      }),
      confirmPassword: z
        .string()
        .min(6, { message: 'La confirmación es requerida' })
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'] // Asigna el error al campo confirmPassword
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const onSubmit = async (user: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    try {
      const res = await createUser(user)
      await updateUser({ displayName: user.name })
      user.uid = res.user.uid

      // Eliminar confirmPassword antes de guardar en Firestore
      const { confirmPassword, ...userData } = user // Esto elimina confirmPassword

      await createUserInDB(userData as User).then(async () => {
        await signOutAccount()
      })
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

  const createUserInDB = async (user: User) => {
    const path = `users/${user.uid}`
    setIsLoading(true)
    try {
      delete user.password

      await setDocument(path, user)
      toast.success('Usuario Creado Exitosamente', { duration: 2500 })
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 })
      } else {
        toast.error('Ocurrió un error desconocido', { duration: 2500 })
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='px-6'>
          Crear
          <CirclePlus className='ml-2 w-[20px]'></CirclePlus>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Crear Producto</DialogTitle>
          <DialogDescription>
            Gestiona tu poducto con la siguiente información.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input id='name' value='Pedro Duarte' className='col-span-3' />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='username' className='text-right'>
              Username
            </Label>
            <Input id='username' value='@peduarte' className='col-span-3' />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit'>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
