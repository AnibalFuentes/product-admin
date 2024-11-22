import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface TableViewProps {
  items: User[];
  getItems: () => Promise<void>;
  deleteUserInDB: (item: User) => Promise<void>;
  isLoading: boolean;
}

export function TableView({
  items,
  getItems,
  deleteUserInDB,
  isLoading,
}: TableViewProps) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "ADMINISTRADOR" | "REFERENTE" | "SOLICITANTE"
  >("all");
  const [unitFilter, setUnitFilter] = useState<"all" | "UI" | "UPGD">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Define la cantidad de elementos por página

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

  // Calcular paginación
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setStatusFilter("all");
    setRoleFilter("all");
    setUnitFilter("all");
    setCurrentPage(1); // Reiniciar a la primera página después de limpiar filtros
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const hasActiveFilters =
    statusFilter !== "all" || roleFilter !== "all" || unitFilter !== "all";

  return (
    <div className="hidden md:block w-full border border-solid border-gray-300 rounded-3xl p-3 m-0">
      {/* Mostrar filtros activos */}
      <div className="flex space-x-2 mb-4">
        {statusFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {statusFilter === "active" ? "Activos" : "Inactivos"}
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
              size="icon"
              onClick={clearFilters}
              className="ml-2 rounded-full hover:bg-transparent size-3"
            >
              <X className="" />
            </Button>
          </Badge>
        )}
      </div>

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[100px]">Imagen</TableHead>
            <TableHead className="text-center">Nombre</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center">
                Tipo
                <Select
                  onValueChange={(value) =>
                    setUnitFilter(value as "all" | "UI" | "UPGD")
                  }
                  value={unitFilter}
                >
                  <SelectTrigger className="w-[100px] ml-2 ">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="UI">UI</SelectItem>
                    <SelectItem value="UPGD">UPGD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead className="text-center w-[250px]">Unidad</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center">
                Rol
                <Select
                  onValueChange={(value) =>
                    setRoleFilter(
                      value as
                        | "all"
                        | "ADMINISTRADOR"
                        | "REFERENTE"
                        | "SOLICITANTE"
                    )
                  }
                  value={roleFilter}
                >
                  <SelectTrigger className="w-[100px] ml-2">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ADMINISTRADOR">ADMINISTRADOR</SelectItem>
                    <SelectItem value="REFERENTE">REFERENTE</SelectItem>
                    <SelectItem value="SOLICITANTE">SOLICITANTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>

            <TableHead className="text-center">
              <div className="flex items-center">
                Estado
                <Select
                  onValueChange={(value) =>
                    setStatusFilter(value as "all" | "active" | "inactive")
                  }
                  value={statusFilter}
                >
                  <SelectTrigger className="w-[100px] ml-2">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableHead>
            <TableHead className="text-center w-[250px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading &&
            paginatedItems.map((item) => (
              <TableRow key={item.uid}>
                <TableCell>
                  <Image
                    className="object-cover w-16 h-16 rounded-full"
                    alt={item.name}
                    src={item.image.url}
                    width={1000}
                    height={1000}
                  />
                </TableCell>
                <TableCell className="font-semibold text-center">
                  {item.name}
                </TableCell>
                <TableCell className="text-center">{item.unit.tipo}</TableCell>
                <TableCell className="text-center">
                  {item.unit.nombre}
                </TableCell>
                <TableCell className="text-center">{item.role}</TableCell>
                <TableCell className="text-center">
                  {item.state ? (
                    <Badge
                      className="border border-green-600"
                      variant="outline"
                    >
                      <CheckCircle color="green" className="mr-1" /> Activo
                    </Badge>
                  ) : (
                    <Badge className="border border-red-600" variant="outline">
                      <Ban color="red" className="mr-1" /> Inactivo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
                    <Button>
                      <SquarePen />
                    </Button>
                  </CreateUpdateItem>
                  {item.role !== "ADMINISTRADOR" && (
                    <ConfirmDeletion
                      deleteUserInDB={deleteUserInDB}
                      item={item}
                    >
                      <Button className="ml-4" variant="destructive">
                        <Trash2 />
                      </Button>
                    </ConfirmDeletion>
                  )}
                </TableCell>
              </TableRow>
            ))}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-16 rounded-xl" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        {!isLoading && filteredItems.length !== 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>Total</TableCell>
              <TableCell className="text-right">
                {filteredItems.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-gray-200 my-20">
          <div className="flex justify-center">
            <LayoutList className="no-data" />
          </div>
          <h2 className="text-center">No hay usuarios disponibles</h2>
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <Button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

//?comment
