'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignIn } from '@/lib/firebase'

const SignInForm = () => {
  const formSchema = z.object({
    email: z
      .string()
      .email('el formato del email no es valido. Ejemplo: user@mail.com')
      .min(1, { message: 'Este campo es requerido' }),
    password: z
      .string()
      .min(6, { message: 'La contraseña debe contener almenos 6 caracteres' })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const { register, handleSubmit, formState } = form
  const { errors } = formState
  //   <===============SignIn===============>
  const onSubmit = async (user: z.infer<typeof formSchema>) => {
    console.log(user)
    try {
      const res = await SignIn(user)
      console.log(res)
    } catch (error) {
      console.error(error)
      //   // Show error message to user
    }
  }

  return (
    <>
      <div className='text-center'>
        <h1 className=' text-2xl font-semibold'>Sign In</h1>
        <p className='text-sm text-muted-foreground'>
          Ingresa tu email y contraseña para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid gap-2'>
          {/* <=================Email=============> */}
          <div className='mb-3'>
            <Label htmlFor='email'>Email</Label>
            <Input
              {...register('email')}
              id='email'
              placeholder='name@example.com'
              type='email'
              autoComplete='email'
            />
            <p className='form-error'>{errors.email?.message}</p>
          </div>
          {/* <=================Passwd============> */}
          <div className='mb-3'>
            <Label htmlFor='password'>Password</Label>
            <Input
              {...register('password')}
              id='password'
              placeholder='******'
              type='password'
            />
            <p className='form-error'>{errors.password?.message}</p>
          </div>
          <Link
            href='/forgot-password'
            className='underline text-muted-foreground underline-offset-4 hover:text-primary mb-6 text-sm text-end'
          >
            Olvidaste la contraseña?
          </Link>

          {/* <=======================Submit===================> */}
          <Button type='submit'> Sign In</Button>
        </div>
      </form>
    </>
  )
}

export default SignInForm
