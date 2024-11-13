import Navbar from '@/components/navbar'
import { Metadata } from 'next'
import Items from './users/components/items'

export const metadata: Metadata = {
  title: 'Dashboard - Product Admin',
  description: 'Sign in to your account'
}

const Dashboard = () => {
  return (
    <>
      <div className="border border-solid border-gray-300 rounded-3xl p-3 m-0 w-full"> {/* Sin márgenes adicionales */}
        Dasboard
      </div>
    </>
  )
}

export default Dashboard




