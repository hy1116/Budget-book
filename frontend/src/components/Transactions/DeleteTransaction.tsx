import { Button, DialogTitle, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { FiTrash2 } from "react-icons/fi"
import { TransactionsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog"

const DeleteTransaction = ({ id }: { id: number }) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast, showErrorToast } = useCustomToast()
    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm()

    const DeleteTransaction = async (id: number) => {
        await TransactionsService.deleteTransaction({ transactionId: id })
    }

    const mutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: () => {
            showSuccessToast("The transation was deleted suecessfully")
            setIsOpen(false)
        },
        onError: () => {
            showErrorToast("An error occurred while deleting the category")
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
        }
    })

    const onSubmit = async () => {
        mutation.mutate(id)
    }

    return (
        <DialogRoot 
            size={{ base: "xs", md: "md" }}
            placement={"center"}
            role="alertdialog"
            open={isOpen}
            onOpenChange={({ open }) => setIsOpen(open)}
        >
            <DialogTrigger asChild>
                <Button variant={"ghost"} size="sm" colorPalette="red">
                    <FiTrash2 fontSize="16px" />
                    Delete Transaction
                </Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogCloseTrigger asChild>
                        <DialogHeader>
                            <DialogTitle>Delete Transactopn</DialogTitle>
                        </DialogHeader>
                    </DialogCloseTrigger>
                    <DialogBody>
                        <Text mb={4}>
                            This category will be permanently deleted. Are you sure? You will not
                            be able to undo this action.
                        </Text>
                    </DialogBody>
                    <DialogFooter>
                        <DialogActionTrigger asChild>
                            <Button
                                variant={"subtle"}
                                colorPalette={"gray"}
                                disabled={isSubmitting}
                            >
                                Cancle
                            </Button>
                            <Button
                                variant="solid"
                                colorPalette={"red"}
                                type="submit"
                                loading={isSubmitting}
                            >
                                Delete
                            </Button>
                        </DialogActionTrigger>
                    </DialogFooter>
                </form>
            </DialogContent>
        </DialogRoot>
    )
}

export default DeleteTransaction