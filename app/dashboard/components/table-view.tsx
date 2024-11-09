import formatPrice from '@/actions/format-price'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Category } from '@/interfaces/category.interface'
import { Eye, EyeOff, SquarePen, TimerReset, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { CreateUpdateItem } from './create-update-item.form'

export function TableView ({
  items,
  getItems
}: {
  items: Category[]
  getItems: () => Promise<void>
}) {
  return (
    <Table>
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader>
        <TableRow>
          <TableHead className='w-[100px]'>Imagen</TableHead>
          <TableHead>nombre</TableHead>
          <TableHead>estado</TableHead>
          <TableHead className='text-center w-[250px]'>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>
              <Image
                className='object-cover w-26 h-16 rounded-full'
                alt={item.name}
                src={item.image.url}
                width={1000}
                height={1000}
              />
            </TableCell>
            <TableCell className='font-semibold w-[350px]'>
              {' '}
              {item.name}
            </TableCell>
            <TableCell>
              {item.state ? (
                <div>
                  <Eye color='green' />
                  <span>visible</span>
                </div>
              ) : (
                <div>
                  <EyeOff color='red' />
                  <span>oculto</span>
                </div>
              )}
            </TableCell>
            <TableCell className='text-center'>
              <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                <Button>
                  <SquarePen />
                </Button>
              </CreateUpdateItem>
              <Button className='ml-4' variant={'destructive'}>
                <Trash2 />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className='text-right'>
            {/* {formatPrice(items.length)} */}
            {items.length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
