"use client"

import {
  Button,
  Input,
  VStack,
  Flex,
  Box,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { Field } from "../ui/field"

export interface CategoryFilterValues {
  searchQuery?: string
}

interface CategoryFiltersProps {
  onApplyFilters: (filters: CategoryFilterValues) => void
  onResetFilters: () => void
  defaultValues?: CategoryFilterValues
}

const CategoryFilters = ({
  onApplyFilters,
  onResetFilters,
  defaultValues,
}: CategoryFiltersProps) => {
  const { register, handleSubmit, reset } = useForm<CategoryFilterValues>({
    defaultValues: defaultValues || {
      searchQuery: undefined,
    },
  })

  const onSubmit = (data: CategoryFilterValues) => {
    // 빈 값 제거
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        return value !== undefined && value !== "" && value !== null
      })
    ) as CategoryFilterValues
    onApplyFilters(cleanedData)
  }

  const handleReset = () => {
    reset({
      searchQuery: undefined,
    })
    onResetFilters()
  }

  return (
    <Box bg="bg.muted" p={4} borderRadius="md" mb={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4} align="stretch">
          <Field label="검색">
            <Input
              {...register("searchQuery")}
              placeholder="카테고리 이름으로 검색..."
            />
          </Field>

          <Flex gap={2} justifyContent="flex-end">
            <Button type="button" variant="outline" onClick={handleReset}>
              초기화
            </Button>
            <Button type="submit" colorScheme="blue">
              검색
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  )
}

export default CategoryFilters
