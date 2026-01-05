"use client"

import {
  Button,
  Input,
  VStack,
  Select,
  createListCollection,
  SimpleGrid,
  Flex,
  Box,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { Field } from "../ui/field"
import { useQuery } from "@tanstack/react-query"
import { CategoriesService } from "@/client"

export interface TransactionFilterValues {
  transactionType?: "income" | "expense"
  categoryId?: number
  paymentMethod?: "cash" | "card"
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  searchQuery?: string
  sortBy?: "date" | "amount"
  sortOrder?: "asc" | "desc"
}

interface TransactionFiltersProps {
  onApplyFilters: (filters: TransactionFilterValues) => void
  onResetFilters: () => void
  defaultValues?: TransactionFilterValues
}

// 거래 유형 옵션
const transactionTypes = createListCollection({
  items: [
    { label: "전체", value: "" },
    { label: "수입", value: "income" },
    { label: "지출", value: "expense" },
  ],
})

// 결제 방법 옵션
const paymentMethods = createListCollection({
  items: [
    { label: "전체", value: "" },
    { label: "현금", value: "cash" },
    { label: "카드", value: "card" },
  ],
})

// 정렬 기준 옵션
const sortByOptions = createListCollection({
  items: [
    { label: "날짜순", value: "date" },
    { label: "금액순", value: "amount" },
  ],
})

// 정렬 순서 옵션
const sortOrderOptions = createListCollection({
  items: [
    { label: "내림차순", value: "desc" },
    { label: "오름차순", value: "asc" },
  ],
})

const TransactionFilters = ({
  onApplyFilters,
  onResetFilters,
  defaultValues,
}: TransactionFiltersProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<TransactionFilterValues>({
    defaultValues: defaultValues || {
      transactionType: undefined,
      categoryId: undefined,
      paymentMethod: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      searchQuery: undefined,
      sortBy: "date",
      sortOrder: "desc",
    },
  })

  // 카테고리 목록 조회
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoriesService.getCategories({ skip: 0, limit: 100 }),
  })

  const categoriesCollection = createListCollection({
    items: [
      { label: "전체", value: "" },
      ...(categoriesData?.items?.map((cat) => ({
        label: cat.name,
        value: cat.id.toString(),
      })) || []),
    ],
  })

  const onSubmit = (data: TransactionFilterValues) => {
    // 빈 값 및 NaN 제거
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        // NaN 체크 추가
        if (typeof value === 'number' && isNaN(value)) return false
        return value !== undefined && value !== "" && value !== null
      })
    ) as TransactionFilterValues
    onApplyFilters(cleanedData)
  }

  const handleReset = () => {
    reset({
      transactionType: undefined,
      categoryId: undefined,
      paymentMethod: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      searchQuery: undefined,
      sortBy: "date",
      sortOrder: "desc",
    })
    onResetFilters()
  }

  return (
    <Box bg="bg.muted" p={4} borderRadius="md" mb={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4} align="stretch">
          {/* 첫 번째 행: 거래유형, 카테고리, 결제방법, 정렬 */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
            <Field label="거래 유형">
              <Select.Root
                collection={transactionTypes}
                defaultValue={defaultValues?.transactionType ? [defaultValues.transactionType] : [""]}
                onValueChange={(e) => {
                  const value = e.value[0]
                  setValue("transactionType", value === "" ? undefined : (value as "income" | "expense"))
                }}
                positioning={{ sameWidth: true }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="전체" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {transactionTypes.items.map((type) => (
                      <Select.Item key={type.value} item={type}>
                        <Select.ItemText>{type.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Field>

            <Field label="카테고리">
              <Select.Root
                collection={categoriesCollection}
                defaultValue={defaultValues?.categoryId ? [defaultValues.categoryId.toString()] : [""]}
                onValueChange={(e) => {
                  const value = e.value[0]
                  setValue("categoryId", value === "" ? undefined : parseInt(value))
                }}
                disabled={categoriesLoading}
                positioning={{ sameWidth: true }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder={categoriesLoading ? "로딩중..." : "전체"} />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {categoriesCollection.items.map((category) => (
                      <Select.Item key={category.value} item={category}>
                        <Select.ItemText>{category.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Field>

            <Field label="결제 방법">
              <Select.Root
                collection={paymentMethods}
                defaultValue={defaultValues?.paymentMethod ? [defaultValues.paymentMethod] : [""]}
                onValueChange={(e) => {
                  const value = e.value[0]
                  setValue("paymentMethod", value === "" ? undefined : (value as "cash" | "card"))
                }}
                positioning={{ sameWidth: true }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="전체" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {paymentMethods.items.map((method) => (
                      <Select.Item key={method.value} item={method}>
                        <Select.ItemText>{method.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Field>

            <Field label="정렬">
              <Flex gap={2}>
                <Box flex={1}>
                  <Select.Root
                    collection={sortByOptions}
                    defaultValue={[defaultValues?.sortBy || "date"]}
                    onValueChange={(e) => setValue("sortBy", e.value[0] as "date" | "amount")}
                    positioning={{ sameWidth: true }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {sortByOptions.items.map((option) => (
                          <Select.Item key={option.value} item={option}>
                            <Select.ItemText>{option.label}</Select.ItemText>
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Box>

                <Box flex={1}>
                  <Select.Root
                    collection={sortOrderOptions}
                    defaultValue={[defaultValues?.sortOrder || "desc"]}
                    onValueChange={(e) => setValue("sortOrder", e.value[0] as "asc" | "desc")}
                    positioning={{ sameWidth: true }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Select.Positioner>
                      <Select.Content>
                        {sortOrderOptions.items.map((option) => (
                          <Select.Item key={option.value} item={option}>
                            <Select.ItemText>{option.label}</Select.ItemText>
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Box>
              </Flex>
            </Field>
          </SimpleGrid>

          {/* 두 번째 행: 날짜 및 금액 범위 */}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <Field label="시작일">
              <Input {...register("startDate")} type="date" />
            </Field>
            <Field label="종료일">
              <Input {...register("endDate")} type="date" />
            </Field>
            <Field label="최소 금액">
              <Input
                {...register("minAmount", { valueAsNumber: true })}
                type="number"
                placeholder="0"
              />
            </Field>
            <Field label="최대 금액">
              <Input
                {...register("maxAmount", { valueAsNumber: true })}
                type="number"
                placeholder="9999999"
              />
            </Field>
          </SimpleGrid>

          {/* 세 번째 행: 검색어 */}
          <Field label="검색">
            <Input
              {...register("searchQuery")}
              placeholder="거래 설명에서 검색..."
            />
          </Field>

          {/* 버튼 */}
          <Flex gap={2} justifyContent="flex-end">
            <Button type="button" variant="outline" onClick={handleReset}>
              초기화
            </Button>
            <Button type="submit" colorScheme="blue">
              필터 적용
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  )
}

export default TransactionFilters
