import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Solicitud } from "@/interfaces/solicitud.interface";
import { CheckCircle, ClockAlert, LayoutList, SquarePen, Trash2, UserSearch, X } from "lucide-react";
import { CreateUpdateItem } from "./create-update-item.form";
import { ConfirmDeletion } from "./confirm-deletion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ListViewProps {
  items: Solicitud[];
  getItems: () => Promise<void>;
  deleteUserInDB: (item: Solicitud) => Promise<void>;
  isLoading: boolean;
}

const ListView = ({
  items,
  isLoading,
  getItems,
  deleteUserInDB
}: ListViewProps) => {
  const [filterBy, setFilterBy] = useState<'Estado' | 'Tipo' | 'Subtipo' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'asignada' | 'finalizada'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sivigila' | 'protocolo'>('all');
  const [subtypeFilter, setSubtypeFilter] = useState<'all' | 'sivigila 1' | 'sivigila 2' | 'Protocolo 1' | 'Protocolo 2'>('all');

  // Opciones de subtipo basadas en el tipo seleccionado
  const subtypeOptions = {
    all: ['sivigila 1', 'sivigila 2', 'Protocolo 1', 'Protocolo 2'],
    sivigila: ['sivigila 1', 'sivigila 2'],
    protocolo: ['Protocolo 1', 'Protocolo 2']
  };
  const currentSubtypeOptions = typeFilter === 'all' ? subtypeOptions.all : subtypeOptions[typeFilter];

  // Filtrar items en función de los filtros de estado, tipo y subtipo
  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.state === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSubtype = subtypeFilter === 'all' || item.subtype === subtypeFilter;

    return matchesStatus && matchesType && matchesSubtype;
  });

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setSubtypeFilter('all');
    setFilterBy('');
  };

  // Comprobar si hay algún filtro activo
  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || subtypeFilter !== 'all';

  return (
    <div className="block md:hidden">
      {/* Selección de filtro */}
      <div className="mb-4 flex space-x-2">
        <Select value={filterBy} onValueChange={(value) => setFilterBy(value as 'Estado' | 'Tipo' | 'Subtipo' | '')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filtros</SelectLabel>
              <SelectItem value="Estado">Estado</SelectItem>
              <SelectItem value="Tipo">Tipo</SelectItem>
              <SelectItem value="Subtipo">Subtipo</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {filterBy === 'Estado' && (
          <Select value={statusFilter !== 'all' ? statusFilter : ''} onValueChange={(value) => setStatusFilter(value as 'all' | 'pendiente' | 'asignada' | 'finalizada')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Estado</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="asignada">Asignada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {filterBy === 'Tipo' && (
          <Select value={typeFilter !== 'all' ? typeFilter : ''} onValueChange={(value) => { setTypeFilter(value as 'all' | 'sivigila' | 'protocolo'); setSubtypeFilter('all'); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipo</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sivigila">Sivigila</SelectItem>
                <SelectItem value="protocolo">Protocolo</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {filterBy === 'Subtipo' && (
          <Select value={subtypeFilter !== 'all' ? subtypeFilter : ''} onValueChange={(value) => setSubtypeFilter(value as 'all' | 'sivigila 1' | 'sivigila 2' | 'Protocolo 1' | 'Protocolo 2')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar subtipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Subtipo</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                {currentSubtypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Mostrar filtros activos */}
      <div className="flex space-x-2 mb-4">
        {statusFilter !== 'all' && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700" variant="outline">
            {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')} className="ml-2 p-0">
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {typeFilter !== 'all' && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700" variant="outline">
            {typeFilter}
            <Button variant="ghost" size="sm" onClick={() => setTypeFilter('all')} className="ml-2 p-0">
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {subtypeFilter !== 'all' && (
          <Badge className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700" variant="outline">
            {subtypeFilter}
            <Button variant="ghost" size="sm" onClick={() => setSubtypeFilter('all')} className="ml-2 p-0">
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

      {/* Renderizar solicitudes filtradas */}
      {!isLoading &&
        filteredItems.map((item) => (
          <div key={item.uid} className="flex flex-col justify-between items-start mb-6 border border-solid border-gray-300 rounded-xl p-6">
            <div className="flex items-center w-full">
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <Badge className="border border-solid border-slate-600 bg-slate-50" variant="outline">{item.type}</Badge>
                <Badge className="border border-solid border-slate-600 bg-slate-50 ml-2" variant="outline">{item.subtype}</Badge>
              </div>
              <div>
                <Badge className={`border ${item.state === 'pendiente' ? 'border-orange-600 bg-orange-200' : item.state === 'asignada' ? 'border-blue-600 bg-blue-50' : 'border-green-600 bg-green-50'}`} variant="outline">
                  {item.state === 'pendiente' ? <ClockAlert color="orange" className="mr-1" /> : item.state === 'asignada' ? <UserSearch color="blue" className="mr-1" /> : <CheckCircle color="green" className="mr-1" />}
                  {item.state.charAt(0).toUpperCase() + item.state.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex justify-end items-center space-x-4 mt-4 w-full">
              <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                <Button className="w-8 h-8 p-0"><SquarePen className="w-5 h-5" /></Button>
              </CreateUpdateItem>
              <ConfirmDeletion deleteUserInDB={deleteUserInDB} item={item}>
                <Button className="w-8 h-8 p-0" variant="destructive"><Trash2 className="w-5 h-5" /></Button>
              </ConfirmDeletion>
            </div>
          </div>
        ))}

      {/* Loading skeletons */}
      {isLoading && Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col justify-between items-start mb-6 border border-solid border-gray-300 rounded-xl p-6">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px] mt-2" />
          <Skeleton className="h-4 w-[200px] mt-2" />
        </div>
      ))}

      {/* No items available */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-gray-200 my-20">
          <div className="flex justify-center">
            <LayoutList className="no-data" />
          </div>
          <h2 className="text-center">No hay solicitudes disponibles</h2>
        </div>
      )}
    </div>
  );
};

export default ListView;
