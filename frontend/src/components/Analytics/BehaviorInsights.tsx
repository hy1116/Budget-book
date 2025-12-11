import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { FiActivity, FiClock, FiCalendar, FiTag, FiTrendingUp } from "react-icons/fi"

import { AnalyticsService } from "@/client"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const BehaviorInsights = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["behaviorInsights"],
    queryFn: () => AnalyticsService.getUserBehaviorInsights(),
  })

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!insights) {
    return (
      <Box p={4}>
        <Text>No insights available. Create some items to see your behavior patterns!</Text>
      </Box>
    )
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "green"
      case "decreasing":
        return "red"
      default:
        return "blue"
    }
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        Your Behavior Insights
      </Heading>

      <VStack gap={4} align="stretch">
        {/* Activity Summary */}
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" shadow="sm">
          <Flex align="center" gap={2} mb={4}>
            <FiActivity />
            <Heading size="md">Activity Summary</Heading>
          </Flex>
          <HStack gap={8}>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Total Items
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {insights.total_items}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Total Comments
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {insights.total_comments}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.500">
                Avg Items/Day
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {insights.average_items_per_day.toFixed(1)}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Activity Patterns */}
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" shadow="sm">
          <Flex align="center" gap={2} mb={4}>
            <FiClock />
            <Heading size="md">Activity Patterns</Heading>
          </Flex>
          <VStack align="stretch" gap={4}>
            <Flex justify="space-between" align="center">
              <HStack>
                <FiClock />
                <Text fontWeight="medium">Most Active Hour:</Text>
              </HStack>
              <Badge colorScheme="blue" fontSize="lg" px={4} py={2}>
                {insights.most_active_hour}:00 - {insights.most_active_hour + 1}:00
              </Badge>
            </Flex>

            <Flex justify="space-between" align="center">
              <HStack>
                <FiCalendar />
                <Text fontWeight="medium">Most Active Day:</Text>
              </HStack>
              <Badge colorScheme="purple" fontSize="lg" px={4} py={2}>
                {DAYS_OF_WEEK[insights.most_active_day]}
              </Badge>
            </Flex>

            <Flex justify="space-between" align="center">
              <HStack>
                <FiTrendingUp />
                <Text fontWeight="medium">Activity Trend:</Text>
              </HStack>
              <Badge colorScheme={getTrendColor(insights.activity_trend)} fontSize="lg" px={4} py={2}>
                {insights.activity_trend.toUpperCase()}
              </Badge>
            </Flex>
          </VStack>
        </Box>

        {/* Top Tags */}
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" shadow="sm">
          <Flex align="center" gap={2} mb={4}>
            <FiTag />
            <Heading size="md">Your Top Tags</Heading>
          </Flex>
          <Flex gap={2} wrap="wrap">
            {insights.top_tags.length > 0 ? (
              insights.top_tags.map((tag, index) => (
                <Badge
                  key={index}
                  colorScheme="blue"
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <Text color="gray.500">No tags yet</Text>
            )}
          </Flex>
        </Box>

        {/* ML Predictions */}
        <Box borderWidth="2px" borderColor="green.500" borderRadius="lg" p={6} bg="green.50" shadow="md">
          <Flex align="center" gap={2} mb={4}>
            <FiTrendingUp />
            <Heading size="md" color="green.700">
              ML Predicted Tags for Your Next Item
            </Heading>
          </Flex>
          <Text mb={3} color="gray.600" fontSize="sm">
            Based on your usage patterns, we predict you might use these tags:
          </Text>
          <Flex gap={2} wrap="wrap">
            {insights.predicted_next_tags.length > 0 ? (
              insights.predicted_next_tags.map((tag, index) => (
                <Badge
                  key={index}
                  colorScheme="green"
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <Text color="gray.500">
                Create more items to get predictions!
              </Text>
            )}
          </Flex>
        </Box>
      </VStack>
    </Box>
  )
}

export default BehaviorInsights
