import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleEllipsis, Mail, RectangleEllipsis, UserPlus } from "lucide-react"

interface DropdownMenuDemoProps {
  onResendVerification: () => void;
}

export function DropdownMenuDemo({ onResendVerification }: DropdownMenuDemoProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <CircleEllipsis className="w-7 h-7 mr-20 hover:bg-gray-200 rounded-full cursor-pointer"/>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup >
          <DropdownMenuItem onClick={onResendVerification} className="cursor-pointer" >
            <Mail />
            <span>Reenviar verificación</span>
            {/* <DropdownMenuShortcut>⇧⌘R</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          {/* <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPlus />
              <span>Invite users</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              
            </DropdownMenuSubContent>
          </DropdownMenuSub> */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
