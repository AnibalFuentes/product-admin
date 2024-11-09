'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendResetEmail } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

const RecoverPasswordForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router =useRouter()

  const formSchema = z.object({
    email: z
      .string()
      .email('el formato del email no es valido. Ejemplo: user@mail.com')
      .min(1, { message: 'Este campo es requerido' })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  })

  const { register, handleSubmit, formState } = form
  const { errors } = formState
  //   <===============SignIn===============>
  const onSubmit = async (user: z.infer<typeof formSchema>) => {
    // console.log(user)

    setIsLoading(true)
    try {
      
      // console.log(res)
      await sendResetEmail(user.email);
      toast.success('Envio Exitoso', { duration: 2500 })
      router.back();
    } catch (error: unknown) {
      // console.error(error)
      if (error instanceof Error) {
        toast.error(error.message, { duration: 2500 })
      } else {
        toast.error('Ocurrió un error desconocido', { duration: 2500 })
      }
      //   // Show error message to user
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='md:border border-solid border-gray-300 rounded-xl p-10'>
      <div className='text-center'>
        <h1 className=' text-2xl font-semibold'>Restablecer Contraseña</h1>
        <p className='text-sm text-muted-foreground'>
          Ingresa tu email para enviarte un link de restablecimiento
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid gap-2'>
          {/* <=================Email=============> */}
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

          {/* <=======================Submit===================> */}
          <Button type='submit' disabled={isLoading}>
            {' '}
            {isLoading && <LoaderCircle className='mr-2 h-4 animate-spin' />}
            {!isLoading && 'Enviar Email'}
          </Button>
        </div>
      </form>
      <p className='text-center text-sm text-muted-foreground mt-3'>
        <Link
          href='/'
          className='underline underline-offset-4 hover:text-primary'
        >
          {'<- Go Back'}
        </Link>
      </p>
    </div>
  )
}

export default RecoverPasswordForm
