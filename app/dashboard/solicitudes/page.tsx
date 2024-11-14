import Navbar from '@/components/navbar'
import { Metadata } from 'next'
import Items from './components/items'
import PageTitle from '@/components/PageTitle'
import { DevelopmentComponent } from '@/components/developmetPage'


export const metadata: Metadata = {
  title: 'Usuarios - Solicitudes Admin',
  description: 'Sign in to your account'
}

const Users = () => {
  return (
    <>
    {/* <PageTitle title='Usuarios' />
    <div className="border border-solid border-gray-300 rounded-3xl p-3 m-0 w-full"> 
      </div> */}
      <DevelopmentComponent/>
    </>
  )
}

export default Users




