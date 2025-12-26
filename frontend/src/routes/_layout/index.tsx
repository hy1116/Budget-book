import { Box, Container, Text, VStack, Grid, GridItem } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"
import CategorySpendingChart from "@/components/Dashboard/CategorySpendingChart"
import MonthlyTrendsChart from "@/components/Dashboard/MonthlyTrendsChart"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <Container maxW="full">
      <VStack align="stretch" gap={6}>
        <Box pt={12} m={4}>
          <Text fontSize="2xl" truncate maxW="sm">
            Hi, {currentUser?.full_name || currentUser?.email} 👋🏼
          </Text>
          <Text>Welcome back, nice to see you again!</Text>
        </Box>
        <Box px={4}>
          <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <CategorySpendingChart />
            </GridItem>
            <GridItem>
              <MonthlyTrendsChart />
            </GridItem>
          </Grid>
        </Box>
      </VStack>
    </Container>
  )
}
