'use client'
import { getCollection } from '@/lib/firebase'
import { CreateUpdateItem } from './create-update-item.form'
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { TableView } from './table-view'
import { Category } from '@/interfaces/category.interface'
import toast from 'react-hot-toast'
import { CirclePlus, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { orderBy } from 'firebase/firestore'

const Items = () => {
  const user = useUser()
  const [items, setItems] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getItems = async () => {
    const path = `categorys`
    const query = [orderBy('createdAt', 'desc')]

    setIsLoading(true)
    try {
      const res = (await getCollection(path, query)) as Category[]
      console.log(res)
      setItems(res)
    } catch (error: any) {
      toast.error(error.message, { duration: 2500 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) getItems()
  }, [user])

  return (
    <>
      <div className='flex justify-between m-4 mb-8'>
        <h1 className='text-2xl ml-1'>Mis Categorias</h1>
        <CreateUpdateItem getItems={getItems}>
          <Button className='px-6'>
            Crear
            <CirclePlus className='ml-2 w-[20px]' />
          </Button>
        </CreateUpdateItem>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader className='animate-spin w-10 h-10' />
        </div>
      ) : (
        <TableView getItems={getItems} items={items} />
      )}
    </>
  )
}

export default Items
