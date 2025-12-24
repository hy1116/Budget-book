import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import type { TransactionResponse } from "@/client"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"
import DeleteTransaction from "./DeleteTransaction"
import EditTransaction from "./EditTransaction"

interface TransactionActionsMenuProps {
  transaction: TransactionResponse
}

export const TransactionActionsMenu = ({ transaction }: TransactionActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditTransaction transaction={transaction} />
        <DeleteTransaction id={transaction.id} />
      </MenuContent>
    </MenuRoot>
  )
}