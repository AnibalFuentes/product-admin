import Navbar from '@/components/navbar'
import { Metadata } from 'next'
import Items from './components/items'

export const metadata: Metadata = {
  title: 'Dashboard - Product Admin',
  description: 'Sign in to your account'
}

const Dashboard = () => {
  return (
    <>
      {/* <Navbar /> */}
      <div className='md:border border-solid border-gray-300 rounded-3xl p-3 md:m-6 lg:mx-36 '>
        <Items />
      </div>
    </>
  )
}

export default Dashboard
