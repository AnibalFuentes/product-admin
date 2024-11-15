import { Button } from '@/components/ui/button'
import { User } from '@/interfaces/user.interface'
import { Ban, CheckCircle, Eye, EyeOff, LayoutList, SquarePen, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { CreateUpdateItem } from './create-update-item.form'
import { ConfirmDeletion } from './confirm-deletion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ListViewProps {
  items: User[]
  getItems: () => Promise<void>
  deleteUserInDB: (item: User) => Promise<void>
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
            className="flex justify-between items-center mb-6 border border-solid border-gray-300 rounded-xl p-6"
            key={item.uid}
          >
            <div className="flex items-center">
              <Image
                className="object-cover w-16 h-16 rounded-full"
                alt={item.name}
                src={item.image.url}
                width={1000}
                height={1000}
              />
              <div className="ml-6">
                <h3 className="font-semibold">{item.name}</h3>
                <div className="text-sm text-gray-500">
                  {item.email}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {item.state ? (
                <Badge
                  className="border border-solid border-green-600 bg-green-50"
                  variant="outline"
                >
                  <CheckCircle color="green" />
                </Badge>
              ) : (
                <Badge
                  className="border border-solid border-red-600 bg-red-50"
                  variant="outline"
                >
                  <Ban color="red" />
                </Badge>
              )}
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
            className="flex justify-between items-center mb-6 border border-solid border-gray-300 rounded-xl p-6"
            key={i}
          >
            <div className="flex items-center">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="ml-6">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px] mt-2" />
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
          <h2 className="text-center">No hay usuarios disponibles</h2>
        </div>
      )}
    </div>
  )
}

export default ListView
