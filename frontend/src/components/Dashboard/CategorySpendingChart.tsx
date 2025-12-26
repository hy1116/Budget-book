import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { TransactionsService } from "@/client"
import { Skeleton } from "../ui/skeleton"

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#ffc0cb",
  "#87ceeb",
  "#dda0dd",
  "#f0e68c",
]

const CategorySpendingChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["category-spending"],
    queryFn: () => TransactionsService.getCategorySpending({ limit: 10 }),
  })

  if (isLoading) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <Skeleton height="400px" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <Text color="red.500">Failed to load spending data</Text>
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>
          카테고리별 지출
        </Heading>
        <Text color="gray.500">지출 데이터가 없습니다.</Text>
      </Box>
    )
  }

  const chartData = data.map(item => ({
    name: item.category_name,
    value: item.total_amount,
    count: item.transaction_count
  }))

  const totalAmount = data.reduce((sum, item) => sum + item.total_amount, 0)
  const totalCount = data.reduce((sum, item) => sum + item.transaction_count, 0)

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg">
      <VStack align="stretch" gap={4}>
        <Heading size="md">카테고리별 지출 비율</Heading>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(1)}%)`}
              outerRadius={130}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => `${(value || 0).toLocaleString()}원`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <Box>
          <Text fontSize="sm" color="gray.600">
            총 지출: {totalAmount.toLocaleString()}원 / {totalCount}건의 거래
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default CategorySpendingChart
