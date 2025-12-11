import { Container } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import BehaviorInsights from "@/components/Analytics/BehaviorInsights"

export const Route = createFileRoute("/_layout/analytics")({
  component: Analytics,
})


function Analytics() {
  return (
    <Container maxW="container.xl">
      <BehaviorInsights />
    </Container>
  )
}
