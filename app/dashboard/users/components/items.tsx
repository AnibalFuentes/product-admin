'use client'

import { deleteImage, getDocument, updateDocument } from '@/lib/firebase'
import { CreateUpdateItem } from './create-update-item.form'
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/use-user'
import { TableView } from './table-view'
import { User } from '@/interfaces/user.interface'
import toast from 'react-hot-toast'
import { CirclePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ListView from './list-view'
import { arrayRemove } from 'firebase/firestore'

const Items = () => {
  const user = useUser()
  const [items, setItems] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  //=========OBTENER USUARIOS DE FIRESTORE
  const getItems = async () => {
    const path = `usuarios/users`

    setIsLoading(true)
    try {
      const res = (await getDocument(path)) as { users: User[] }
      if (res && res.users) {
        setItems(res.users)
      } else {
        setItems([])
      }
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

  //================ELIMINAR USUARIO DE FIRESTORE
  const deleteUserInDB = async (item: User) => {
    const path = `usuarios/users`
    setIsLoading(true)
    try {
      await deleteImage(item.image.path) // Eliminar la imagen del usuario
      await updateDocument(path, {
        users: arrayRemove(item) // Remover el usuario del array en Firestore
      })
      toast.success('Usuario Eliminado Exitosamente 🗑️', { duration: 2500 })

      const newItems = items.filter(i => i.uid !== item.uid)
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
    <div className="w-full"> {/* Asegúrate de que tenga w-full */}
      <div className="flex justify-between m-4 mb-8">
        <h1 className="text-2xl ml-1">Usuarios</h1>
        <CreateUpdateItem getItems={getItems}>
          <Button className="px-6">
            Crear
            <CirclePlus className="ml-2 w-[20px]" />
          </Button>
        </CreateUpdateItem>
      </div>
      <TableView
        deleteUserInDB={deleteUserInDB}
        getItems={getItems}
        items={items}
        isLoading={isLoading}
      />
      <ListView
        getItems={getItems}
        deleteUserInDB={deleteUserInDB}
        items={items}
        isLoading={isLoading}
      />
    </div>
  )
}

export default Items
