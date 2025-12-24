import { TransactionsService } from '@/client'
import AddTransaction from '@/components/Transactions/AddTransaction'
import { TransactionActionsMenu } from '@/components/Transactions/TransactionActionMenu'
import { Container, EmptyState, Flex, Heading, Table, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FiSearch } from 'react-icons/fi'
import { z } from 'zod'
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const transactionsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 10

function getTransactionsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      TransactionsService.getTransactions({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["transactions", { page }],
  }
}

export const Route = createFileRoute('/_layout/transactions')({
  component: Transactions,
  validateSearch: (search) => transactionsSearchSchema.parse(search),
})

// 거래 타입 한글 변환
const getTransactionTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    income: '수입',
    expense: '지출',
  }
  return labels[type] || type
}

// 결제 방법 한글 변환
const getPaymentMethodLabel = (method: string | null | undefined) => {
  if (!method) return '-'
  const labels: { [key: string]: string } = {
    cash: '현금',
    card: '카드',
  }
  return labels[method] || method
}

function Transactions() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Transaction Management
      </Heading>
      <AddTransaction />
      <TransactionTable />
    </Container>
  )

  function TransactionTable() {
    const navigate = useNavigate({ from: Route.fullPath })
    const { page = 1 } = Route.useSearch()

    const { data, isLoading, isPlaceholderData } = useQuery({
      ...getTransactionsQueryOptions({ page }),
      placeholderData: (prevData) => prevData,
    })

    const setPage = (page: number) => {
      navigate({
        to: "/transactions",
        search: (prev) => ({ ...prev, page }),
      })
    }

    const transactions = data?.items ?? []
    const count = data?.total ?? 0

    if (isLoading) {
      return <div>로딩중...</div>
    }

    if (transactions.length === 0) {
        return (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <FiSearch />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>You don't have any transactions yet</EmptyState.Title>
                <EmptyState.Description>
                  Add a new transaction to get started
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
              <Table.ColumnHeader>Transaction Date</Table.ColumnHeader>
              <Table.ColumnHeader>Transaction Type</Table.ColumnHeader>
              <Table.ColumnHeader>Category</Table.ColumnHeader>
              <Table.ColumnHeader>Amount</Table.ColumnHeader>
              <Table.ColumnHeader>Description</Table.ColumnHeader>
              <Table.ColumnHeader>payment_method</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions.map((t) => (
              <Table.Row key={t.id} opacity={isPlaceholderData ? 0.5 : 1}>
                <Table.Cell>{new Date(t.transaction_date).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{getTransactionTypeLabel(t.transaction_type)}</Table.Cell>
                <Table.Cell>{t.category?.name || '-'}</Table.Cell>
                <Table.Cell>{t.amount.toLocaleString()}원</Table.Cell>
                <Table.Cell truncate maxW="30%">{t.description || '-'}</Table.Cell>
                <Table.Cell>{getPaymentMethodLabel(t.payment_method)}</Table.Cell>
                <Table.Cell>
                  <Flex gap={2}>
                    <TransactionActionsMenu transaction={t} />
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
}