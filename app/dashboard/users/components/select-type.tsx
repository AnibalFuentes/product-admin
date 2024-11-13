import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface unidadesProps {
  unidad: 'UI' | 'UPGD';
  onUnidadChange: (value: 'UI' | 'UPGD') => void;
}

interface rolesProps {
  role: 'ADMIN' | 'OPERARIO' | 'USUARIO';
  onRoleChange: (value: 'ADMIN' | 'OPERARIO' | 'USUARIO') => void;
}

export function SelectUnidad ({ unidad, onUnidadChange }: unidadesProps) {
  const handleUnidadChange = (value: 'UI' | 'UPGD') => {
    onUnidadChange(value); // Pasamos el valor seleccionado al componente padre
  };

  return (
    <Select onValueChange={handleUnidadChange} value={unidad}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Selecciona una unidad' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value='UPGD'>UPGD</SelectItem>
          <SelectItem value='UI'>UI</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
export function SelectRole ({ role, onRoleChange }: rolesProps) {
  const handleUnidadChange = (value: 'ADMIN' | 'OPERARIO' | 'USUARIO') => {
    onRoleChange(value) // Pasamos el valor seleccionado al componente padre
  }

  return (
    <Select onValueChange={handleUnidadChange} value={role}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Selecciona un rol' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value='USUARIO'>Usuario</SelectItem>
          <SelectItem value='OPERARIO'>Operario</SelectItem>
          <SelectItem value='ADMIN'>Administrador</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
