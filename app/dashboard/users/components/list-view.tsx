import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/interfaces/user.interface";
import {
  Ban,
  CheckCircle,
  LayoutList,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { CreateUpdateItem } from "./create-update-item.form";
import { ConfirmDeletion } from "./confirm-deletion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ListViewProps {
  items: User[];
  getItems: () => Promise<void>;
  deleteUserInDB: (item: User) => Promise<void>;
  isLoading: boolean;
}

const ListView = ({
  items,
  isLoading,
  getItems,
  deleteUserInDB,
}: ListViewProps) => {
  const [filterBy, setFilterBy] = useState<'Estado' | 'Rol' | 'Unidad' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'OPERARIO' | 'USUARIO'>('all');
  const [unitFilter, setUnitFilter] = useState<'all' | 'UI' | 'UPGD'>('all');

  // Filtrar items en función de los filtros de estado, rol y unidad
  const filteredItems = items.filter((item) => {
    const statusMatch = statusFilter === 'all' || (statusFilter === 'active' && item.state) || (statusFilter === 'inactive' && !item.state);
    const roleMatch = roleFilter === 'all' || item.role === roleFilter;
    const unitMatch = unitFilter === 'all' || item.unit === unitFilter;

    return statusMatch && roleMatch && unitMatch;
  });

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
    setUnitFilter('all');
    setFilterBy('');
  };

  // Comprobar si hay algún filtro activo
  const hasActiveFilters = statusFilter !== 'all' || roleFilter !== 'all' || unitFilter !== 'all';

  return (
    <div className="block md:hidden">
      {/* Selección de filtro */}
      <div className="mb-4 flex space-x-2">
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as 'Estado' | 'Rol' | 'Unidad' | '')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filtros</SelectLabel>
              <SelectItem value="Estado">Estado</SelectItem>
              <SelectItem value="Rol">Rol</SelectItem>
              <SelectItem value="Unidad">Unidad</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {filterBy === 'Estado' && (
          <Select value={statusFilter !== 'all' ? statusFilter : ''} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Estado</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {filterBy === 'Rol' && (
          <Select value={roleFilter !== 'all' ? roleFilter : ''} onValueChange={(value) => setRoleFilter(value as 'all' | 'ADMIN' | 'OPERARIO' | 'USUARIO')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rol</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="OPERARIO">OPERARIO</SelectItem>
                <SelectItem value="USUARIO">USUARIO</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {filterBy === 'Unidad' && (
          <Select value={unitFilter !== 'all' ? unitFilter : ''} onValueChange={(value) => setUnitFilter(value as 'all' | 'UI' | 'UPGD')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Unidad</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="UI">UI</SelectItem>
                <SelectItem value="UPGD">UPGD</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mostrar filtros activos */}
      <div className="flex space-x-2 mb-4">
        {statusFilter !== 'all' && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700" variant="outline">
            {statusFilter === 'active' ? 'Activo' : 'Inactivo'}
            <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="ml-2 p-0">
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {roleFilter !== 'all' && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700" variant="outline">
            {roleFilter}
            <Button variant="ghost" size="sm" onClick={() => setRoleFilter('all')} className="ml-2 p-0">
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {unitFilter !== 'all' && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700" variant="outline">
            {unitFilter}
            <Button variant="ghost" size="sm" onClick={() => setUnitFilter('all')} className="ml-2 p-0">
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {hasActiveFilters && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-red-100 text-red-700" variant="outline">
            Limpiar Filtros
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-2 p-0">
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Render items if available */}
      {!isLoading &&
        filteredItems.map((item) => (
          <div
            className="flex justify-between items-center mb-6 border border-solid border-gray-300 rounded-xl p-6 "
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
                <Badge
                  className="border border-solid border-slate-900 bg-slate-50 text-sm mb-1 mr-16"
                  variant="outline"
                >
                  {item.email}
                </Badge>
               <div>
               <Badge
                  className="border border-solid border-blue-600 bg-blue-50 text-sm"
                  variant="outline"
                >
                  {item.role}
                </Badge>
                <Badge
                  className="border border-solid border-slate-600 bg-slate-50 text-sm ml-1"
                  variant="outline"
                >
                  {item.unit}
                </Badge>
               </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 ">
              {item.state ? (
                <Badge
                  className="border border-solid border-green-600 bg-green-50 "
                  variant="outline"
                >
                  <CheckCircle color="green " />
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
              {item.role!=='ADMIN'&&<ConfirmDeletion deleteUserInDB={deleteUserInDB} item={item}>
                <Button className="w-8 h-8 p-0" variant="destructive">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </ConfirmDeletion>}
              
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
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-gray-200 my-20">
          <div className="flex justify-center">
            <LayoutList className="no-data" />
          </div>
          <h2 className="text-center">No hay usuarios disponibles</h2>
        </div>
      )}
    </div>
  );
};

export default ListView;
