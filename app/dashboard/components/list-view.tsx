// import formatPrice from '@/actions/format-price'
import { Button } from '@/components/ui/button'

import { Category } from '@/interfaces/category.interface'
import { Eye, EyeOff, LayoutList, SquarePen, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { CreateUpdateItem } from './create-update-item.form'
import { ConfirmDeletion } from './confirm-deletion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface ListViewProps {
  items: Category[]
  getItems: () => Promise<void>
  deleteCategoryInDB: (item: Category) => Promise<void>
  isLoading: boolean
}
const ListView = ({
  items,
  isLoading,
  getItems,
  deleteCategoryInDB
}: ListViewProps) => {
  return (
    <div className='block md:hidden'>
      {!isLoading &&
        items &&
        items.map(item => (
          <div
            className='flex justify-between items-center mb-6 border border-solid border-gray-300 rounded-xl p-6'
            key={item.id}
          >
            <div className='flex justify-start items-center'>
              <Image
                className='object-cover w-16 h-16 rounded-full'
                alt={item.name}
                src={item.image.url}
                width={1000}
                height={1000}
              />
              <div className='ml-6'>
                <h3 className='font-semibold'>{item.name}</h3>
                <div className='text-sm'>
                  {item.name}
                  <br />
                </div>
              </div>
            </div>
            {item.state ? (
              <div>
                <Badge
                  className='border border-solid border-green-600 bg-green-50'
                  variant={'outline'}
                >
                  <Eye color='green' />
                </Badge>
              </div>
            ) : (
              <div>
                <Badge
                  className='border border-solid border-red-600 bg-red-50'
                  variant={'outline'}
                >
                  <EyeOff color='red' />
                </Badge>
              </div>
            )}
            <div className=''>
              {/* ==========update========= */}
              <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                <Button className='ml-4 w-8 h-8 p-0'>
                  <SquarePen className='w-5 h-5' />
                </Button>
              </CreateUpdateItem>
              <div className='mb-2'></div>

              {/* ==========delete========= */}
              <ConfirmDeletion
                deleteCategoryInDB={deleteCategoryInDB}
                item={item}
              >
                <Button className='ml-4 w-8 h-8 p-0' variant={'destructive'}>
                  <Trash2 className='w-5 h-5' />
                </Button>
              </ConfirmDeletion>
            </div>
          </div>
        ))}

        {/* //==========LOADING===========// */}

      {isLoading &&
        [1, 1, 1, 1, 1].map((item, i) => (
          <div
          className='flex justify-between items-center mb-6 border border-solid border-gray-300 rounded-xl p-6'
          key={i}
          >
            <div className='flex justify-start items-center'>
              <Skeleton className='w-16 h-16 rounded-xl' />
              <div className='ml-6'>
                <Skeleton className='h-4 w-[150px] ' />
                <Skeleton className='h-4 w-[100px] mt-2 ' />
              </div>
            </div>
          </div>
        ))}
        {/* //==========NO HAY ITEMS DISPONIBLES===========// */}
        {!isLoading && items.length === 0 && (
        <div className='text-gray-200 my-20'>
          <div className='flex justify-center'>
            <LayoutList className='no-data' />
          </div>
          <h2 className='text-center'> No hay categorias disponibles</h2>
        </div>
      )}
    </div>
  )
}

export default ListView
