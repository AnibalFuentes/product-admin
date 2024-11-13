import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Category } from '@/interfaces/category.interface'
//   import { Button } from "@/components/ui/button"
interface ConfirmDeletionProps {
  children: React.ReactNode
  deleteCategoryInDB: (item: Category) => Promise<void>
  item: Category
}

export function ConfirmDeletion ({
  children,
  deleteCategoryInDB,
  item
}: ConfirmDeletionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Estás seguro de eliminar esta categoria?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer, esto eliminará permanentemente el
            producto
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='hover:bg-blue-400'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteCategoryInDB(item)}
            className='bg-red-900   hover:bg-red-600 hover:animate-none animate-pulse'
          >
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
