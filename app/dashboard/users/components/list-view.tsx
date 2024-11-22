import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [filterBy, setFilterBy] = useState<"Estado" | "Rol" | "Unidad" | "">(
    ""
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "ADMINISTRADOR" | "REFERENTE" | "SOLICITANTE"
  >("all");
  const [unitFilter, setUnitFilter] = useState<"all" | "UI" | "UPGD">("all");

  // Estado para el diálogo
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filtrar items en función de los filtros de estado, rol y unidad
  const filteredItems = items.filter((item) => {
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && item.state) ||
      (statusFilter === "inactive" && !item.state);
    const roleMatch = roleFilter === "all" || item.role === roleFilter;
    const unitMatch = unitFilter === "all" || item.unit.tipo === unitFilter;

    return statusMatch && roleMatch && unitMatch;
  });

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setStatusFilter("all");
    setRoleFilter("all");
    setUnitFilter("all");
    setFilterBy("");
  };

  // Comprobar si hay algún filtro activo
  const hasActiveFilters =
    statusFilter !== "all" || roleFilter !== "all" || unitFilter !== "all";

  return (
    <div className="block md:hidden overflow-hidden max-w-full">
      {/* Selección de filtro */}
      <div className="mb-4 flex space-x-2">
        <Select
          value={filterBy}
          onValueChange={(value) =>
            setFilterBy(value as "Estado" | "Rol" | "Unidad" | "")
          }
        >
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

        {filterBy === "Estado" && (
          <Select
            value={statusFilter !== "all" ? statusFilter : ""}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
          >
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

        {filterBy === "Rol" && (
          <Select
            value={roleFilter !== "all" ? roleFilter : ""}
            onValueChange={(value) =>
              setRoleFilter(
                value as "all" | "ADMINISTRADOR" | "REFERENTE" | "SOLICITANTE"
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rol</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                <SelectItem value="REFERENTE">REFERENTE</SelectItem>
                <SelectItem value="SOLICITANTE">SOLICITANTE</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {filterBy === "Unidad" && (
          <Select
            value={unitFilter !== "all" ? unitFilter : ""}
            onValueChange={(value) =>
              setUnitFilter(value as "all" | "UI" | "UPGD")
            }
          >
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
        {statusFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {statusFilter === "active" ? "Activo" : "Inactivo"}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="ml-2 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {roleFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {roleFilter}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRoleFilter("all")}
              className="ml-2 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {unitFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {unitFilter}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUnitFilter("all")}
              className="ml-2 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {hasActiveFilters && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-red-100 text-red-700"
            variant="outline"
          >
            Limpiar Filtros
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-2 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
      </div>

      {/* Renderizar elementos */}
      {!isLoading &&
        filteredItems.map((item) => (
          <div
            className="flex justify-between items-center mb-6 border border-solid border-gray-300 rounded-xl p-4 w-full overflow-hidden"
            key={item.uid}
          >
            <div className="flex items-center w-full overflow-hidden">
              <Image
                className="object-cover w-16 h-16 rounded-full flex-shrink-0 cursor-pointer"
                alt={item.name}
                src={item.image.url}
                width={1000}
                height={1000}
                onClick={() => setSelectedUser(item)}
              />
              <div className="ml-4 flex-grow overflow-hidden">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge
                    className="border border-solid border-slate-900 text-sm truncate"
                    variant="outline"
                  >
                    {item.email}
                  </Badge>
                  <Badge
                    className="border border-solid border-blue-600 text-sm truncate"
                    variant="outline"
                  >
                    {item.role}
                  </Badge>
                  <Badge
                    className="border border-solid border-slate-600 text-sm truncate"
                    variant="outline"
                  >
                    {item.unit.tipo}
                  </Badge>
                  {item.state ? (
                    <Badge
                      className="border border-solid border-green-600"
                      variant="outline"
                    >
                      <CheckCircle color="green" />
                    </Badge>
                  ) : (
                    <Badge
                      className="border border-solid border-red-600"
                      variant="outline"
                    >
                      <Ban color="red" />
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                <Button className="w-8 h-8 p-0">
                  <SquarePen className="w-5 h-5" />
                </Button>
              </CreateUpdateItem>
              {item.role !== "ADMINISTRADOR" && (
                <ConfirmDeletion deleteUserInDB={deleteUserInDB} item={item}>
                  <Button className="w-8 h-8 p-0" variant="destructive">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </ConfirmDeletion>
              )}
            </div>
          </div>
        ))}

      {/* Skeleton loading */}
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

      {/* Sin resultados */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-gray-200 my-20">
          <div className="flex justify-center">
            <LayoutList className="no-data" />
          </div>
          <h2 className="text-center">No hay usuarios disponibles</h2>
        </div>
      )}

      {/* Dialogo de información */}
      {selectedUser && (
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUser.name}</DialogTitle>
              <DialogDescription>
                <div className="flex flex-col items-center">
                  <Image
                    className="rounded-full"
                    alt={selectedUser.name}
                    src={selectedUser.image.url}
                    width={150}
                    height={150}
                  />
                  <p className="mt-4">{selectedUser.email}</p>
                  <p>{selectedUser.role}</p>
                  <p>{selectedUser.unit.tipo}</p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ListView;
