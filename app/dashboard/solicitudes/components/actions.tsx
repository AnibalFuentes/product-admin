import fileToBase64 from "@/actions/convert-file-to-base64";
import { setInLocalstorage } from "@/actions/set-in-localstorage";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { Solicitud } from "@/interfaces/solicitud.interface";
import {
  getDocument,
  signOutAccount,
  updateDocument,
  uploadBase64,
} from "@/lib/firebase";
import {
  CircleUserRound,
  EllipsisVertical,
  FileText,
  ImagePlus,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  SquarePen,
  Trash,
  User,
  UserSearch,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CreateUpdateItem } from "./create-update-item.form";
import { ConfirmDeletion } from "./confirm-deletion";

interface ActionsSolProps {
  deleteUserInDB: (item: Solicitud) => Promise<void>; // Cambia la función a deleteUserInDB
  item: Solicitud;
  getItems: () => Promise<void>;
}

export const ActionsSolDropdown = ({
  deleteUserInDB,
  item,

  getItems,
}: ActionsSolProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="mx-4">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="text-center">Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CreateUpdateItem getItems={getItems} itemToUpdate={item}>
              <SquarePen className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </CreateUpdateItem>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <UserSearch className="mr-2 h-4 w-4" />
            <span>Asignar</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ConfirmDeletion deleteUserInDB={deleteUserInDB} item={item}>
            <Trash className="mr-2 h-4 w-4" />
            <span> Eliminar</span>
          </ConfirmDeletion>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
