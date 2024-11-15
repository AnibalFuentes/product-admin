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
import { Ban, CheckCircle, ClockAlert, LayoutList, SquarePen, Trash2, UserSearch } from 'lucide-react'
import Image from 'next/image'
import { CreateUpdateItem } from './create-update-item.form'
import { ConfirmDeletion } from './confirm-deletion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Solicitud } from '@/interfaces/solicitud.interface'

interface TableViewProps {
  items: Solicitud[]
  getItems: () => Promise<void>
  deleteUserInDB: (item: Solicitud) => Promise<void>
  isLoading: boolean
}

export function TableView ({
  items,
  getItems,
  deleteUserInDB,
  isLoading
}: TableViewProps) {
  return (
    <div className='hidden md:block w-full border border-solid border-gray-300 rounded-3xl p-3 m-0'>
      <Table className='w-full'>
        <TableHeader>
          <TableRow>
            
            <TableHead className='text-center'>Nombre</TableHead>
            <TableHead className='text-center'>Descripcion</TableHead>
            <TableHead className='text-center'>tipo</TableHead>
            <TableHead className='text-center'>Estado</TableHead>
            <TableHead className='text-center w-[250px]'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading &&
            items &&
            items.map(item => (
              <TableRow key={item.uid}>
                
                <TableCell className='font-semibold text-center'>{item.name}</TableCell>
                <TableCell className='text-center'>{item.description}</TableCell>
                <TableCell className='text-center'>{item.type} {item.subtype}</TableCell>
                <TableCell className='text-center'>
                <div>
                      <Badge
                        className={`border border-solid ${ item.state==='pendiente'?'border-orange-600 bg-orange-200':item.state==='asignada'?'border-blue-600 bg-blue-50':'border-green-600 bg-green-50'}`}
                        variant={'outline'}
                      >
                        {item.state==='pendiente'?<ClockAlert color='orange' className='mr-1' />:item.state==='asignada'?<UserSearch color='blue' className='mr-1' />:<CheckCircle color='green' className='mr-1' />

                      }
                      {
                        item.state==='pendiente'?'Pendiente':item.state==='asignada'?'Asignada':'Finalizada'
                      }
                        
                      </Badge>
                    </div>
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
              <TableCell colSpan={5}>Total</TableCell>
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
