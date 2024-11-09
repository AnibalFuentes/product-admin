// import Logo from '@/components/logo'
import { Metadata } from 'next'
import RecoverPasswordForm from '@/app/(auth)/forgot-password/components/recover-password.form'

export const metadata: Metadata = {
  title: 'Product Admin',
  description: 'Sign in to your account'
}

const ForgotPassword = () => {
  return (
     
     <div className='pt-10 lg:p-8 flex items-center md:h-[70vh] '>
     <div className='mx-auto flex flex-col justify-center space-y-6 sm:w-[450px]'>
       <RecoverPasswordForm />
     </div>
   </div>
    
  )
}

export default ForgotPassword
