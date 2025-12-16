import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"

import { CategoriesService } from "@/client"
import { CategoryActionsMenu } from "@/components/Categories/CategoryActionsMenu"
import AddCategory from "@/components/Categories/AddCategory"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/category")({
  component: Category,
})

function CategoryTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoriesService.readCategories(),
  })

  const categories = data || []

  if (isLoading) {
    return (
      <VStack gap={4} align="stretch">
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
      </VStack>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any categories yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new category to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <Table.Root size={{ base: "sm", md: "md" }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Name</Table.ColumnHeader>
          <Table.ColumnHeader>Description</Table.ColumnHeader>
          <Table.ColumnHeader>Created At</Table.ColumnHeader>
          <Table.ColumnHeader>Actions</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {categories.map((category) => (
          <Table.Row key={category.id}>
            <Table.Cell>{category.name}</Table.Cell>
            <Table.Cell truncate maxW="30%">
              {category.description}
            </Table.Cell>
            <Table.Cell>
              {new Date(category.created_at).toLocaleDateString()}
            </Table.Cell>
            <Table.Cell>
              <Flex gap={2}>
                <CategoryActionsMenu category={category} />
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}

function Category() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Category Management
      </Heading>
      <AddCategory />
      <CategoryTable />
    </Container>
  )
}
