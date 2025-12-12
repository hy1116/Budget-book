import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  EmptyState,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { FiMessageSquare } from "react-icons/fi"

import { CommentsService, type CommentPublic } from "@/client"
import AddComment from "./AddComment"
import EditComment from "./EditComment"
import DeleteComment from "./DeleteComment"
import useAuth from "@/hooks/useAuth"

interface CommentSectionProps {
  itemId: string
}

const CommentSection = ({ itemId }: CommentSectionProps) => {
  const { user: currentUser } = useAuth()

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", itemId],
    queryFn: () => CommentsService.readComments({ itemId: itemId }),
  })

  const comments = commentsData?.data ?? []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <Box mt={4}>
        <Flex justifyContent="center" p={4}>
          <Spinner />
        </Flex>
      </Box>
    )
  }

  return (
    <Box mt={6} p={4} borderWidth="1px" borderRadius="md">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Comments ({comments.length})</Heading>
        <AddComment itemId={itemId} />
      </Flex>

      {comments.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiMessageSquare />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>No comments yet</EmptyState.Title>
              <EmptyState.Description>
                Be the first to comment!
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <VStack align="stretch" gap={3}>
          {comments.map((comment: CommentPublic) => (
            <Box
              key={comment.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg="bg.subtle"
            >
              <Flex justifyContent="space-between" alignItems="start">
                <Box flex="1">
                  <HStack mb={2}>
                    <Text fontWeight="bold" fontSize="sm">
                      {comment.author_name || "Anonymous"}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(comment.created_at)}
                    </Text>
                    {comment.created_at !== comment.updated_at && (
                      <Text fontSize="xs" color="gray.500" fontStyle="italic">
                        (edited)
                      </Text>
                    )}
                  </HStack>
                  <Text whiteSpace="pre-wrap">{comment.content}</Text>
                </Box>
                {currentUser && comment.author_id === currentUser.id && (
                  <HStack>
                    <EditComment comment={comment} />
                    <DeleteComment comment={comment} />
                  </HStack>
                )}
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  )
}

export default CommentSection
