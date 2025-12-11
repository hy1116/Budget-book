import {
  Button,
  DialogActionTrigger,
  Textarea,
  Text,
  VStack,
  IconButton,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiEdit } from "react-icons/fi"

import { type ApiError, type CommentPublic, type CommentUpdate, CommentsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditCommentProps {
  comment: CommentPublic
}

const EditComment = ({ comment }: EditCommentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      content: comment.content,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: CommentUpdate) =>
      CommentsService.updateComment({ id: comment.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Comment updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", comment.item_id] })
    },
  })

  const onSubmit: SubmitHandler<CommentUpdate> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <IconButton aria-label="Edit comment" size="sm" variant="ghost">
          <FiEdit />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Comment</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update your comment below.</Text>
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
              loading={isSubmitting}
            >
              Update
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditComment
