'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

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

const SignUpForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

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
    <>
      <div className='text-center'>
        <h1 className='text-2xl font-semibold'>Registrar Usuario</h1>
        <p className='text-sm text-muted-foreground'>
          Ingresa tu email y contraseña para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid gap-2'>
          {/* Nombre */}
          <div className='mb-3'>
            <Label htmlFor='name'>Nombre</Label>
            <Input
              {...register('name')}
              id='name'
              placeholder='John Doe'
              type='text'
              autoComplete='name'
            />
            <p className='form-error'>{errors.name?.message}</p>
          </div>

          {/* Correo */}
          <div className='mb-3'>
            <Label htmlFor='email'>Correo</Label>
            <Input
              {...register('email')}
              id='email'
              placeholder='name@example.com'
              type='email'
              autoComplete='email'
            />
            <p className='form-error'>{errors.email?.message}</p>
          </div>

          {/* Contraseña */}
          <div className='mb-3 relative'>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              {...register('password')}
              id='password'
              placeholder='******'
              type={showPassword ? 'text' : 'password'}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-2 top-9'
            >
              {showPassword ? (
                <EyeOff className='h-5 w-5' />
              ) : (
                <Eye className='h-5 w-5' />
              )}
            </button>
            <p className='form-error'>{errors.password?.message}</p>
          </div>

          {/* Confirmar Contraseña */}
          <div className='mb-3 relative'>
            <Label htmlFor='confirmPassword'>Confirmar Contraseña</Label>
            <Input
              {...register('confirmPassword')}
              id='confirmPassword'
              placeholder='******'
              type={showConfirmPassword ? 'text' : 'password'}
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-2 top-9'
            >
              {showConfirmPassword ? (
                <EyeOff className='h-5 w-5' />
              ) : (
                <Eye className='h-5 w-5' />
              )}
            </button>
            <p className='form-error'>{errors.confirmPassword?.message}</p>
          </div>

          <Link
            href='/forgot-password'
            className='underline text-muted-foreground underline-offset-4 hover:text-primary mb-6 text-sm text-end'
          >
            ¿Olvidaste la contraseña?
          </Link>

          {/* Botón de Registro */}
          <Button type='submit' disabled={isLoading}>
            {isLoading && <LoaderCircle className='mr-2 h-4 animate-spin' />}
            {!isLoading && 'Registrar'}
          </Button>
        </div>
      </form>
    </>
  )
}

export default SignUpForm
