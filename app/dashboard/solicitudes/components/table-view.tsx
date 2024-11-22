import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  ClockAlert,
  Ghost,
  LayoutList,
  SquarePen,
  Trash2,
  User,
  UserSearch,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Solicitud } from "@/interfaces/solicitud.interface";
import { CreateUpdateItem } from "./create-update-item.form";
import { ConfirmDeletion } from "./confirm-deletion";
import { ActionsSolDropdown } from "./actions";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssingOp } from "./assignOp";
import { useUser } from "@/hooks/use-user";
import Image from "next/image";

interface TableViewProps {
  items: Solicitud[];
  getItems: () => Promise<void>;
  deleteUserInDB: (item: Solicitud) => Promise<void>;
  isLoading: boolean;
}

export function TableView({
  items,
  getItems,
  deleteUserInDB,
  isLoading,
}: TableViewProps) {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pendiente" | "asignada" | "finalizada"
  >("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [subtypeFilter, setSubtypeFilter] = useState<Subtype>("all");
  const [isOperarioDialogOpen, setIsOperarioDialogOpen] = useState(false);
  const [selectedOperario, setSelectedOperario] = useState<Solicitud | null>(
    null
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const typeOptions = [
    { value: "all", label: "Todos" },
    { value: "sivigila", label: "Sivigila" },
    { value: "protocolo", label: "Protocolo" },
  ];
  type TypeFilter = "all" | "sivigila" | "protocolo";
  type SubtypeSivigila = "sivigila 1" | "sivigila 2";
  type SubtypeProtocolo = "Protocolo 1" | "Protocolo 2";
  type Subtype = SubtypeSivigila | SubtypeProtocolo | "all";

  const subtypeOptions: Record<TypeFilter, Subtype[]> = {
    all: ["sivigila 1", "sivigila 2", "Protocolo 1", "Protocolo 2"],
    sivigila: ["sivigila 1", "sivigila 2"],
    protocolo: ["Protocolo 1", "Protocolo 2"],
  };

  const currentSubtypeOptions =
    typeFilter === "all" ? subtypeOptions.all : subtypeOptions[typeFilter];

  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.state === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesSubtype =
      subtypeFilter === "all" || item.subtype === subtypeFilter;

    return matchesStatus && matchesType && matchesSubtype;
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSubtypeFilter("all");
    setCurrentPage(1); // Reset page to 1 after clearing filters
  };

  const hasActiveFilters =
    statusFilter !== "all" || typeFilter !== "all" || subtypeFilter !== "all";

  // Calculate pagination values
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="hidden md:block w-full border border-solid border-gray-300 rounded-3xl p-3 m-0">
      <div className="flex space-x-2 mb-4">
        {statusFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
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
        {typeFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {typeFilter}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTypeFilter("all")}
              className="ml-2 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
        {subtypeFilter !== "all" && (
          <Badge
            className="flex items-center border border-solid border-gray-300 bg-gray-100 text-gray-700"
            variant="outline"
          >
            {subtypeFilter}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubtypeFilter("all")}
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

      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Nombre</TableHead>
            <TableHead className="text-center">Descripción</TableHead>

            <TableHead className="text-center">
              <div className="flex items-center ">
                Tipo
                <Select
                  onValueChange={(value) => {
                    setTypeFilter(value as TypeFilter);
                    setSubtypeFilter("all");
                  }}
                  value={typeFilter}
                >
                  <SelectTrigger className="w-[100px] ml-2">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableHead>

            <TableHead className="text-center">
              <div className="flex items-center">
                Subtipo
                <Select
                  onValueChange={(value) => setSubtypeFilter(value as Subtype)}
                  value={subtypeFilter}
                >
                  <SelectTrigger className="w-[100px] ml-2">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {currentSubtypeOptions.map((subtype) => (
                      <SelectItem key={subtype} value={subtype}>
                        {subtype}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableHead>

            <TableHead className="text-center">
              <div className="flex items-center">
                Estado
                <Select
                  onValueChange={(value) =>
                    setStatusFilter(
                      value as "all" | "pendiente" | "asignada" | "finalizada"
                    )
                  }
                  value={statusFilter}
                >
                  <SelectTrigger className="w-[100px] ml-2">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="asignada">Asignada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
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
                <TableCell className="font-semibold text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                  {item.name}
                </TableCell>
                <TableCell className="text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                  {item.description}
                </TableCell>
                <TableCell className="text-center">{item.type}</TableCell>
                <TableCell className="text-center">{item.subtype}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    onMouseEnter={() => {
                      if (
                        item.state === "asignada" ||
                        item.state === "finalizada"
                      ) {
                        setSelectedOperario(item); // Establece el operario seleccionado
                        setIsOperarioDialogOpen(true); // Abre el diálogo
                      }
                    }}
                    // onMouseLeave={() => {
                    //   setIsOperarioDialogOpen(false); // Cierra el diálogo
                    //   setSelectedOperario(null); // Limpia el operario seleccionado
                    // }}
                    className={`border border-solid ${
                      item.state === "pendiente"
                        ? "border-orange-600 "
                        : item.state === "asignada"
                        ? "border-blue-600 cursor-pointer "
                        : "border-green-600 cursor-pointer"
                    }`}
                    variant={"outline"}
                  >
                    {item.state === "pendiente" ? (
                      <ClockAlert color="orange" className="mr-1" />
                    ) : item.state === "asignada" ? (
                      <UserSearch color="blue" className="mr-1" />
                    ) : (
                      <CheckCircle color="green" className="mr-1" />
                    )}
                    {item.state.charAt(0).toUpperCase() + item.state.slice(1)}
                  </Badge>
                </TableCell>
                <Dialog
                  open={isOperarioDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsOperarioDialogOpen(false);
                      setSelectedOperario(null); // Limpia el operario seleccionado al cerrar
                    }
                  }}
                >
                  <DialogContent className="space-y-2">
                    <DialogHeader>
                      <DialogTitle>Información del Operario</DialogTitle>
                      <DialogDescription>
                        Datos del operario asignado a esta solicitud.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedOperario?.operario?.image?.url ? (
                      <Image
                        src={selectedOperario.operario.image.url}
                        alt="Operario"
                        width={1000}
                        height={1000}
                        className="object-cover w-32 h-32 rounded-full m-auto"
                      />
                    ) : (
                      <p>No hay imagen disponible</p>
                    )}
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {selectedOperario?.operario?.name || "No disponible"}
                    </p>
                    <p>
                      <strong>Email:</strong>{" "}
                      {selectedOperario?.operario?.email || "No disponible"}
                    </p>
                    <p>
                      <strong>Unidad:</strong>{" "}
                      {selectedOperario?.operario?.unit || "No disponible"}
                    </p>
                    <p>
                      <strong>Rol:</strong>{" "}
                      {selectedOperario?.operario?.role || "No disponible"}
                    </p>
                  </DialogContent>
                </Dialog>

                <TableCell className="text-center">
                  <Popover modal={true}>
                    <PopoverTrigger>
                      <Button variant="ghost" size="sm">
                        <LayoutList className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      {" "}
                      {/* Ajusta automáticamente al contenido */}
                      <div className="mb-2">
                        <CreateUpdateItem
                          getItems={getItems}
                          itemToUpdate={item}
                        >
                          <Button variant="ghost">
                            <span className="flex items-center">
                              <SquarePen className="mr-2 w-4 h-4" />
                              {user?.role === "ADMIN"
                                ? "Editar o Responder"
                                : user?.role === "OPERARIO"
                                ? "Responder"
                                : "Editar"}
                            </span>
                          </Button>
                        </CreateUpdateItem>
                      </div>
                      {user?.role === "ADMIN" && (
                        <div>
                          <ConfirmDeletion
                            deleteUserInDB={deleteUserInDB}
                            item={item}
                          >
                            <Button variant={"ghost"}>
                              <span className="flex items-center">
                                <Trash2 className="mr-2 w-4 h-4 text-red-600" />
                                Eliminar
                              </span>
                            </Button>
                          </ConfirmDeletion>
                        </div>
                      )}
                      {user?.role === "ADMIN" && (
                        <div>
                          <AssingOp item={item} getItems={getItems}>
                            <Button variant={"ghost"}>
                              <span className="flex items-center">
                                <User className="mr-2 w-4 h-4 text-blue-600" />
                                Asignar
                              </span>
                            </Button>
                          </AssingOp>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-10" />
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
          <h2 className="text-center">No hay solicitudes disponibles</h2>
        </div>
      )}
      {/* Pagination Controls */}
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
