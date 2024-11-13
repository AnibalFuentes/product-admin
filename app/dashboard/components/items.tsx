'use client'
import { deleteDocument, deleteImage, getCollection } from '@/lib/firebase'
import { CreateUpdateItem } from './create-update-item.form'
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { TableView } from './table-view'
import { Category } from '@/interfaces/category.interface'
import toast from 'react-hot-toast'
import { CirclePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { orderBy } from 'firebase/firestore'
import ListView from './list-view'

const Items = () => {
  const user = useUser()
  const [items, setItems] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  //=========OBTENER ITEMS FIREBASE
  const getItems = async () => {
    const path = `categorys`
    const query = [orderBy('createdAt', 'desc')]

    setIsLoading(true)
    try {
      const res = (await getCollection(path, query)) as Category[]
      console.log(res)
      setItems(res)
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
  //================DELETE ITEM

  const deleteCategoryInDB = async (item: Category) => {
    const path = `categorys/${item.id}`
    setIsLoading(true)
    try {
      await deleteImage(item.image.path)
      await deleteDocument(path)
      toast.success('Categoria Eliminada Exitosamente 🗑️', { duration: 2500 })

      const newItems = items.filter(i => i.id != item.id)
      setItems(newItems)
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

  useEffect(() => {
    if (user) getItems()
    
  }, [user])

  return (
    <div className='w-full'>
      <div className='flex justify-between m-4 mb-8'>
        <h1 className='text-2xl ml-1'>Mis Categorias</h1>
        <CreateUpdateItem getItems={getItems}>
          <Button className='px-6'>
            Crear
            <CirclePlus className='ml-2 w-[20px]' />
          </Button>
        </CreateUpdateItem>
      </div>
      <TableView
        deleteCategoryInDB={deleteCategoryInDB}
        getItems={getItems}
        items={items}
        isLoading={isLoading}
      />
      <ListView
        getItems={getItems}
        deleteCategoryInDB={deleteCategoryInDB}
        items={items}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Items
