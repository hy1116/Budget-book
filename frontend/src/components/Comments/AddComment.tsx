import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Textarea,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaPlus } from "react-icons/fa"

import { type CommentCreate, CommentsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface AddCommentProps {
  itemId: string
}

const AddComment = ({ itemId }: AddCommentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CommentCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      content: "",
      item_id: itemId,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CommentCreate) =>
      CommentsService.createComment({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Comment added successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", itemId] })
    },
  })

  const onSubmit: SubmitHandler<CommentCreate> = (data) => {
    mutation.mutate({ ...data, item_id: itemId })
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-comment" size="sm" variant="outline">
          <FaPlus fontSize="12px" />
          Add Comment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Write your comment below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.content}
                errorText={errors.content?.message}
                label="Comment"
              >
                <Textarea
                  {...register("content", {
                    required: "Comment is required.",
                    minLength: {
                      value: 1,
                      message: "Comment must be at least 1 character.",
                    },
                    maxLength: {
                      value: 1000,
                      message: "Comment must be at most 1000 characters.",
                    },
                  })}
                  placeholder="Write your comment here..."
                  rows={4}
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
              disabled={!isValid}
              loading={isSubmitting}
            >
              Post Comment
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddComment
