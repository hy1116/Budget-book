import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { CategoriesService } from "@/client"
import AddCategory from "@/components/Categories/AddCategory"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoryActionsMenu } from "@/components/Categories/CategoryActionsMenu"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const categoriesSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getCategoriesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      CategoriesService.getCategories({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["categories", { page }],
  }
}

export const Route = createFileRoute("/_layout/category")({
  component: Category,
  validateSearch: (search) => categoriesSearchSchema.parse(search),
})

function CategoryTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page = 1 } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getCategoriesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) => {
    navigate({
      to: "/category",
      search: (prev) => ({ ...prev, page }),
    })
  }

  const categories = data?.items ?? []
  const count = data?.total ?? 0

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
    <>
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
            <Table.Row key={category.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{category.name}</Table.Cell>
              <Table.Cell truncate maxW="30%">
                {category.description}
              </Table.Cell>
              <Table.Cell>
                {category.created_at &&
                  new Date(category.created_at).toLocaleDateString()}
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
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          page={page}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
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
