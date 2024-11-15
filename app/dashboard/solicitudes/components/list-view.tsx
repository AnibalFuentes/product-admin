import { Button } from '@/components/ui/button'
import {
  Ban,
  CheckCircle,
  ClockAlert,
  LayoutList,
  SquarePen,
  Trash2,
  UserSearch
} from 'lucide-react'
import Image from 'next/image'
import { CreateUpdateItem } from './create-update-item.form'
import { ConfirmDeletion } from './confirm-deletion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Solicitud } from '@/interfaces/solicitud.interface'

interface ListViewProps {
  items: Solicitud[]
  getItems: () => Promise<void>
  deleteUserInDB: (item: Solicitud) => Promise<void>
  isLoading: boolean
}

const ListView = ({
  items,
  isLoading,
  getItems,
  deleteUserInDB
}: ListViewProps) => {
  return (
    <div className="block md:hidden">
      {/* Render items if available */}
      {!isLoading &&
        items &&
        items.map((item) => (
          <div
            className="flex flex-col justify-between items-start mb-6 border border-solid border-gray-300 rounded-xl p-6"
            key={item.uid}
          >
            <div className="flex items-center w-full">
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-sm text-gray-500">{item.type} {item.subtype}</p>
              </div>
              <div>
                <Badge
                  className={`border border-solid ${ 
                    item.state === 'pendiente' ? 'border-orange-600 bg-orange-200' :
                    item.state === 'asignada' ? 'border-blue-600 bg-blue-50' :
                    'border-green-600 bg-green-50'
                  }`}
                  variant="outline"
                >
                  {
                    item.state === 'pendiente' ? <ClockAlert color="orange" className="mr-1" /> :
                    item.state === 'asignada' ? <UserSearch color="blue" className="mr-1" /> :
                    <CheckCircle color="green" className="mr-1" />
                  }
                  {
                    item.state === 'pendiente' ? 'Pendiente' :
                    item.state === 'asignada' ? 'Asignada' : 'Finalizada'
                  }
                </Badge>
              </div>
            </div>
            <div className="flex justify-end items-center space-x-4 mt-4 w-full">
              <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                <Button className="w-8 h-8 p-0">
                  <SquarePen className="w-5 h-5" />
                </Button>
              </CreateUpdateItem>
              <ConfirmDeletion deleteUserInDB={deleteUserInDB} item={item}>
                <Button className="w-8 h-8 p-0" variant="destructive">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </ConfirmDeletion>
            </div>
          </div>
        ))}

      {/* Loading skeletons */}
      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => (
          <div
            className="flex flex-col justify-between items-start mb-6 border border-solid border-gray-300 rounded-xl p-6"
            key={i}
          >
            <div className="flex items-center w-full">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="ml-6 flex-grow">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px] mt-2" />
                <Skeleton className="h-4 w-[200px] mt-2" />
              </div>
            </div>
          </div>
        ))}

      {/* No items available */}
      {!isLoading && items.length === 0 && (
        <div className="text-gray-200 my-20">
          <div className="flex justify-center">
            <LayoutList className="no-data" />
          </div>
          <h2 className="text-center">No hay solicitudes disponibles</h2>
        </div>
      )}
    </div>
  )
}

export default ListView
