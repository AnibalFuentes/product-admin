import Navbar from '@/components/navbar'
import { Metadata } from 'next'
import Items from './components/items'
import PageTitle from '@/components/PageTitle'


export const metadata: Metadata = {
  title: 'Usuarios - Solicitudes Admin',
  description: 'Sign in to your account'
}

const Users = () => {
  return (
    <>
    <PageTitle title='Usuarios' />
    <div className='flex flex-col'> {/* Sin márgenes adicionales */}
        <Items />
      </div>
    </>
  )
}

export default Users




