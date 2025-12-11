import {
  Button,
  DialogTitle,
  Text,
  VStack,
  Box,
  Flex,
  Badge,
} from "@chakra-ui/react"
import { useState } from "react"
import { FiEye, FiTag } from "react-icons/fi"

import type { ItemPublic } from "@/client"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import CommentSection from "../Comments/CommentSection"

interface ItemDetailsProps {
  item: ItemPublic
}

const ItemDetails = ({ item }: ItemDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DialogRoot
      size={{ base: "full", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <FiEye />
          View
        </Button>
      </DialogTrigger>
      <DialogContent maxH="90vh" overflowY="auto">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Description:
              </Text>
              <Text color={!item.description ? "gray" : "inherit"}>
                {item.description || "No description provided"}
              </Text>
            </Box>

            {item.tags && item.tags.length > 0 && (
              <Box>
                <Flex align="center" gap={2} mb={2}>
                  <FiTag />
                  <Text fontWeight="bold">Tags:</Text>
                </Flex>
                <Flex gap={2} wrap="wrap">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} colorScheme="blue" px={2} py={1}>
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            )}

            <Box>
              <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.500">
                Item ID: {item.id}
              </Text>
            </Box>

            <CommentSection itemId={item.id} />
          </VStack>
        </DialogBody>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default ItemDetails
