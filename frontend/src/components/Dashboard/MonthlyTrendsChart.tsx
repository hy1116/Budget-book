import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TransactionsService } from "@/client"
import { Skeleton } from "../ui/skeleton"

const MonthlyTrendsChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["monthly-trends"],
    queryFn: () => TransactionsService.getMonthlyTrends({ months: 6 }),
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
        <Text color="red.500">Failed to load trends data</Text>
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={4}>
          월별 수입/지출 추이
        </Heading>
        <Text color="gray.500">추이 데이터가 없습니다.</Text>
      </Box>
    )
  }

  const chartData = data.map(item => ({
    month: `${item.year}년 ${item.month}월`,
    수입: item.income,
    지출: item.expense,
    순수익: item.net
  }))

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg">
      <VStack align="stretch" gap={4}>
        <Heading size="md">월별 수입/지출 추이 (최근 6개월)</Heading>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={(value) => `${(value / 10000).toFixed(0)}만원`}
            />
            <Tooltip
              formatter={(value: number | undefined) => `${(value || 0).toLocaleString()}원`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="수입"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="지출"
              stroke="#ff8042"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="순수익"
              stroke="#8884d8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <Box>
          <Text fontSize="sm" color="gray.600">
            수입/지출의 변화 추이를 확인하세요
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default MonthlyTrendsChart
