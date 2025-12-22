import { TransactionsService } from '@/client'
import AddTransaction from '@/components/Transactions/AddTransaction'
import { Container, EmptyState, Heading, Table, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { FiSearch } from 'react-icons/fi'

export const Route = createFileRoute('/_layout/transactions')({
  component: Transactions,
})

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
    const { data, isLoading } = useQuery({
      queryKey: ["transactions"],
      queryFn: () => TransactionsService.readTransactions(),
    })

    const transactions = data || []

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
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Transaction Date</Table.ColumnHeader>
            <Table.ColumnHeader>Transaction Type</Table.ColumnHeader>
            <Table.ColumnHeader>Category</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Description</Table.ColumnHeader>
            <Table.ColumnHeader>payment_method</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transactions.map((t) => (
            <Table.Row key={t.id}>
              <Table.Cell>{new Date(t.transaction_date).toLocaleDateString()}</Table.Cell>
              <Table.Cell>{t.transaction_type}</Table.Cell>
              <Table.Cell>{t.category_id}</Table.Cell>
              <Table.Cell>{t.amount}</Table.Cell>
              <Table.Cell truncate maxW="30%">{t.description}</Table.Cell>
              <Table.Cell>{t.payment_method}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    )
  }
}