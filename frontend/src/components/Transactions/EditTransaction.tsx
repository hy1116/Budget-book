import { ApiError, CategoriesService, TransactionResponse, TransactionsService, TransactionUpdate } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { DialogCloseTrigger, DialogContent, DialogRoot, DialogTrigger, DialogActionTrigger, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { FiTrash2 } from "react-icons/fi"
import { Text, Button, VStack, Input, Select, createListCollection, Textarea } from "@chakra-ui/react"
import { handleError } from "@/utils"
import { Field } from "../ui/field"

// Enum 정의
const transactionTypes = createListCollection({
  items: [
    { label: "수입", value: "income" },
    { label: "지출", value: "expense" },
  ],
})

const paymentMethods = createListCollection({
  items: [
    { label: "현금", value: "cash" },
    { label: "카드", value: "card" },
  ],
})

interface EditTransactionProps {
    transaction: TransactionResponse
}

const EditTransaction = ({ transaction }: EditTransactionProps ) => {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { showSuccessToast } = useCustomToast()

    // Categories 조회
    const { data: categories, isLoading: categoriesLoading } = useQuery({
      queryKey: ["categories"],
      queryFn: () => CategoriesService.getCategories({}),
    })

    const categoriesCollection = createListCollection({
      items: categories?.map((cat) => ({
        label: cat.name,
        value: cat.id.toString(),
      })) || [],
    })

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TransactionUpdate>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            amount: transaction.amount,
            description: transaction.description,
            transaction_date: transaction.transaction_date,
            transaction_type: transaction.transaction_type,
            category_id: transaction.category_id,
            payment_method: transaction.payment_method,
        }
    })

    const mutation = useMutation({
        mutationFn: (data: TransactionUpdate) =>
            TransactionsService.updateTransaction({
                transactionId: transaction.id,
                requestBody: data
            }),
        onSuccess: () => {
            showSuccessToast("The transation was updated suecessfully")
            reset()
            setIsOpen(false)
        },
        onError: (err: ApiError) => {
            handleError(err)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] })
        }
    })

    const onSubmit: SubmitHandler<TransactionUpdate> = async (data) => {
        mutation.mutate(data)
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
                <Button variant={"ghost"} size="sm">
                    <FiTrash2 fontSize="16px" />
                    Edit Transaction
                </Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <Text mb={4}>Update the transaction details below.</Text>
                    <VStack gap={4}>
                        <Field
                        required
                        invalid={!!errors.amount}
                        errorText={errors.amount?.message}
                        label="Amount"
                        >
                        <Input
                            {...register("amount", {
                            required: "Amount is required.",
                            valueAsNumber: true,
                            })}
                            placeholder="Transaction amount"
                            type="number"
                        />
                        </Field>
        
                        <Field
                        required
                        invalid={!!errors.transaction_type}
                        errorText={errors.transaction_type?.message}
                        label="Transaction Type"
                        >
                        <Select.Root
                            collection={transactionTypes}
                            defaultValue={["expense"]}
                            onValueChange={(e) => setValue("transaction_type", e.value[0] as "income" | "expense")}
                            positioning={{ sameWidth: true }}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                            <Select.Trigger>
                                <Select.ValueText placeholder="Select transaction type" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                            <Select.Content>
                                {transactionTypes.items.map((type) => (
                                <Select.Item key={type.value} item={type}>
                                    <Select.ItemText>{type.label}</Select.ItemText>
                                    <Select.ItemIndicator />
                                </Select.Item>
                                ))}
                            </Select.Content>
                            </Select.Positioner>
                        </Select.Root>
                        </Field>
        
                        <Field
                        required
                        invalid={!!errors.category_id}
                        errorText={errors.category_id?.message}
                        label="Category"
                        >
                        <Select.Root
                            collection={categoriesCollection}
                            onValueChange={(e) => setValue("category_id", parseInt(e.value[0]))}
                            disabled={categoriesLoading}
                            positioning={{ sameWidth: true }}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                            <Select.Trigger>
                                <Select.ValueText placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                            <Select.Content>
                                {categoriesCollection.items.map((category) => (
                                <Select.Item key={category.value} item={category}>
                                    <Select.ItemText>{category.label}</Select.ItemText>
                                    <Select.ItemIndicator />
                                </Select.Item>
                                ))}
                            </Select.Content>
                            </Select.Positioner>
                        </Select.Root>
                        </Field>
        
                        <Field
                        required
                        invalid={!!errors.transaction_date}
                        errorText={errors.transaction_date?.message}
                        label="Transaction Date"
                        >
                        <Input
                            {...register("transaction_date", {
                            required: "Transaction date is required.",
                            })}
                            placeholder="Transaction date"
                            type="date"
                        />
                        </Field>
        
                        <Field
                        invalid={!!errors.payment_method}
                        errorText={errors.payment_method?.message}
                        label="Payment Method"
                        >
                        <Select.Root
                            collection={paymentMethods}
                            defaultValue={["cash"]}
                            onValueChange={(e) => setValue("payment_method", (e.value[0] as "cash" | "card") || null)}
                            positioning={{ sameWidth: true }}
                        >
                            <Select.HiddenSelect />
                            <Select.Control>
                            <Select.Trigger>
                                <Select.ValueText placeholder="Select payment method" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                                <Select.Indicator />
                            </Select.IndicatorGroup>
                            </Select.Control>
                            <Select.Positioner>
                            <Select.Content>
                                {paymentMethods.items.map((method) => (
                                <Select.Item key={method.value} item={method}>
                                    <Select.ItemText>{method.label}</Select.ItemText>
                                    <Select.ItemIndicator />
                                </Select.Item>
                                ))}
                            </Select.Content>
                            </Select.Positioner>
                        </Select.Root>
                        </Field>
        
                        <Field label="Description">
                        <Textarea
                            {...register("description")}
                            placeholder="Description"
                        />
                        </Field>
                    </VStack>
                    </DialogBody>
        
                    
                    <DialogFooter gap={2}>
                    <DialogActionTrigger asChild>
                        <Button
                        variant="subtle"
                        colorPalette="gray"
                        disabled={isSubmitting}
                        >
                        Cancel
                        </Button>
                    </DialogActionTrigger>
                    <Button
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                        Save
                    </Button>
                    </DialogFooter>
                </form>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    )
}

export default EditTransaction