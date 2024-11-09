'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CirclePlus, LoaderCircle } from 'lucide-react'

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDocument, updateDocument, uploadBase64 } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ItemImage } from '../../../interfaces/item-image.interface'
import DragAndDropImage from '@/components/drag-and-drop-image'
import { useUser } from '@/hooks/use-user'
import { Category } from '@/interfaces/category.interface'
import { Switch } from '@/components/ui/switch'
import { SwitchStateItem } from './switch-state-item'
import Image from 'next/image'

interface CreateUpdateItemProps {
  children: React.ReactNode
  itemToUpdate?: Category
  getItems: () => Promise<void>
}

export function CreateUpdateItem ({
  children,
  itemToUpdate,
  getItems
}: CreateUpdateItemProps) {
  const user = useUser()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [image, setImage] = useState<string>('')

  const formSchema = z.object({
    image: z.object({
      path: z.string(),
      url: z.string()
    }),
    state: z.boolean(),
    name: z
      .string()
      .min(2, { message: 'Este campo es requerido, al menos 2 caracteres' })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: itemToUpdate
      ? itemToUpdate
      : {
          image: {} as ItemImage,
          name: '',
          state: false
        }
  })

  const { register, handleSubmit, formState, setValue, reset } = form
  const { errors } = formState

  const handleImage = (url: string) => {
    const path = itemToUpdate
      ? itemToUpdate.image.path
      : `${user?.uid}/${Date.now()}`
    setValue('image', { url, path })

    setImage(url)
  }

  useEffect(() => {
    if (itemToUpdate) setImage(itemToUpdate.image.url)
  }, [open])

  const onSubmit = (item: z.infer<typeof formSchema>) => {
    if (itemToUpdate) updateCategoryInDB(item)
    else createCategoryInDB(item)
  }

  const createCategoryInDB = async (item: Category) => {
    const path = `categorys`
    setIsLoading(true)
    try {
      const base64 = item.image.url
      const imagePath = item.image.path
      const imageUrl = await uploadBase64(imagePath, base64)

      item.image.url = imageUrl
      await addDocument(path, item)
      toast.success('Categoria Creada Exitosamente', { duration: 2500 })
      // Cerrar el diálogo y reiniciar el formulario
      getItems()
      setIsDialogOpen(false) // Cierra el diálogo
      form.reset() // Limpia el formulario
    } catch (error: any) {
      toast.error(error.message, { duration: 2500 })
    } finally {
      setIsLoading(false)
    }
  }
  const updateCategoryInDB = async (item: Category) => {
    const path = `categorys/${itemToUpdate?.id}`
    setIsLoading(true)
    try {
      if (itemToUpdate?.image.url != item.image.url) {
        const base64 = item.image.url
        const imagePath = item.image.path
        const imageUrl = await uploadBase64(imagePath, base64)

        item.image.url = imageUrl
      }
      await updateDocument(path, item)
      toast.success('Categoria Actualizada Exitosamente', { duration: 2500 })
      // Cerrar el diálogo y reiniciar el formulario
      getItems()
      setIsDialogOpen(false) // Cierra el diálogo
      form.reset() // Limpia el formulario
    } catch (error: any) {
      toast.error(error.message, { duration: 2500 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {itemToUpdate ? 'Editar Categoria' : 'Crear Categoria'}
          </DialogTitle>
          <DialogDescription>
            Gestiona tu Categoria con la siguiente información.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            {/*==================== Image========= */}
            <div className='mb-3'>
              <Label htmlFor='image'>Imagen</Label>
              {image ? (
                <div className='text-center'>
                  <Image
                    width={1000}
                    height={1000}
                    src={image}
                    alt='item-image'
                    className='w-[50%] m-auto'
                  />
                  <Button
                    className='mt-3'
                    variant={'destructive'}
                    type='button'
                    onClick={() => handleImage('')}
                    disabled={isLoading}
                  >
                    Remover Imagen
                  </Button>
                </div>
              ) : (
                <DragAndDropImage handleImage={handleImage} />
              )}
            </div>
            {/* =====================Nombre===================== */}
            <div className='mb-3'>
              <Label htmlFor='name'>Nombre</Label>
              <Input
                {...register('name')}
                id='name'
                placeholder='nombre categoria'
                type='text'
                autoComplete='name'
              />
              <p className='form-error'>{errors.name?.message}</p>
            </div>
            <div className='mb-3'>
              <SwitchStateItem />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <LoaderCircle className='mr-2 h-4 animate-spin' />}
              {itemToUpdate ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
