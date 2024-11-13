// import formatPrice from '@/actions/format-price'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { User } from '@/interfaces/user.interface'
import { Ban, CheckCircle, LayoutList, SquarePen, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { CreateUpdateItem } from './create-update-item.form'
import { ConfirmDeletion } from './confirm-deletion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface TableViewProps {
  items: User[]
  getItems: () => Promise<void>
  deleteUserInDB: (item: User) => Promise<void>
  isLoading: boolean
}

export function TableView ({
  items,
  getItems,
  deleteUserInDB,
  isLoading
}: TableViewProps) {
  return (
    <div className='hidden md:block w-full border border-solid border-gray-300 rounded-3xl p-3 m-0'> {/* Añadido w-full aquí */}
      <Table className='w-full'> {/* Añadido w-full aquí */}
        <TableHeader>
          <TableRow>
            <TableHead className='text-center w-[100px]'>Imagen</TableHead>
            <TableHead className='text-center'>Nombre</TableHead>
            <TableHead className='text-center'>Estado</TableHead>
            <TableHead className='text-center w-[250px]'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading &&
            items &&
            items.map(item => (
              <TableRow key={item.uid}>
                <TableCell>
                  <Image
                    className='object-cover w-16 h-16 rounded-full'
                    alt={item.name}
                    src={item.image.url}
                    width={1000}
                    height={1000}
                  />
                </TableCell>
                <TableCell className='font-semibold text-center'>{item.name}</TableCell>
                <TableCell className='text-center'>
                  {item.state ? (
                    <div>
                      <Badge
                        className='border border-solid border-green-600 bg-green-50'
                        variant={'outline'}
                      >
                        <CheckCircle color='green' className='mr-1' /> Activo
                      </Badge>
                    </div>
                  ) : (
                    <div>
                      <Badge
                        className='border border-solid border-red-600 bg-red-50'
                        variant={'outline'}
                      >
                        <Ban color='red' className='mr-1' /> Inactivo
                      </Badge>
                    </div>
                  )}
                </TableCell>
                <TableCell className='text-center'>
                  <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                    <Button>
                      <SquarePen />
                    </Button>
                  </CreateUpdateItem>
                  <ConfirmDeletion
                    deleteUserInDB={deleteUserInDB}
                    item={item}
                  >
                    <Button className='ml-4' variant={'destructive'}>
                      <Trash2 />
                    </Button>
                  </ConfirmDeletion>
                </TableCell>
              </TableRow>
            ))}
          {isLoading &&
            [1, 1, 1, 1, 1].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-16 rounded-xl' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-full' />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        {!isLoading && items.length !== 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className='text-right'>
                {items.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
      {!isLoading && items.length === 0 && (
        <div className='text-gray-200 my-20'>
          <div className='flex justify-center'>
            <LayoutList className='no-data' />
          </div>
          <h2 className='text-center'>No hay usuarios disponibles</h2>
        </div>
      )}
    </div>
  )
}
