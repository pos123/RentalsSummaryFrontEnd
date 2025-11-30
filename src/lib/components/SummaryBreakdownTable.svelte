<script lang="ts">
	import type { SummaryModel, ItemDetail } from '@/utils/common';
	import { formatItemDetail } from '@/utils/common';
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Calendar, TrendingDown, TrendingUp } from '@lucide/svelte';

	interface Props {
		modelData: SummaryModel;
		currency: 'GBP' | 'EUR';
	}

	let { modelData, currency }: Props = $props();

	function formatCell(item: ItemDetail | undefined, curr: 'GBP' | 'EUR') {
		if (!item) return '';
		const val = curr === 'EUR' ? item.amountInEur : item.amountInGbp;
		if (Math.abs(val) < 0.01) return '';
		return formatItemDetail(item, curr, true);
	}

	function hasActivity(row: any): boolean {
		// Check if there's any income or expenses in the period
		return Math.abs(row.totalIncome.amountInGbp) >= 0.01 || Math.abs(row.totalExpenses.amountInGbp) >= 0.01;
	}

	function getExpenseCategories(): string[] {
		if (!modelData.header) return [];
		return modelData.header.filter(h => h !== 'Rent and other Income');
	}

	function getIncomeCategories(): string[] {
		if (!modelData.header) return [];
		return modelData.header.filter(h => h === 'Rent and other Income');
	}

	function getNetProfit(income: ItemDetail, expenses: ItemDetail): ItemDetail {
		return {
			amountInGbp: income.amountInGbp - expenses.amountInGbp,
			amountInEur: income.amountInEur - expenses.amountInEur,
			identifiers: []
		};
	}
</script>

{#if modelData.periodBreakdownData}
	<div class="rounded-md border shadow-sm overflow-hidden">
		<Table.Root class="text-sm">
			<Table.Header>
				<Table.Row class="bg-slate-50 hover:bg-slate-50">
					<Table.Head class="text-center w-[120px] border-r font-semibold text-slate-700">
						<div class="flex items-center justify-center gap-2">
							<Calendar size={14} />
							Period
						</div>
					</Table.Head>
					<Table.Head class="text-center border-r font-semibold text-slate-700">
						<div class="flex items-center justify-center gap-2">
							Total Income
						</div>
					</Table.Head>
					<Table.Head class="text-center border-r font-semibold text-slate-700">
						<div class="flex items-center justify-center gap-2">
							Total Expenses
						</div>
					</Table.Head>
					<Table.Head class="text-center font-semibold text-slate-700">
						<div class="flex items-center justify-center gap-2">
							Net Income
						</div>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Object.values(modelData.periodBreakdownData).sort((a, b) => a.period.localeCompare(b.period)).filter(row => hasActivity(row)) as row, idx}
					<Table.Row class={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
						<Table.Cell class="text-center border-r p-2">
							{row.period}
						</Table.Cell>
						<Table.Cell class="text-center border-r p-0">
							<Popover.Root>
								<Popover.Trigger class="w-full h-full p-2 hover:bg-muted/50 text-green-700">
									{formatItemDetail(row.totalIncome, currency, true)}
								</Popover.Trigger>
								<Popover.Content class="w-80 shadow-lg">
									<div class="grid gap-3">
										<div class="space-y-2">
											<h4 class="font-medium leading-none mb-3 flex items-center gap-2">
												<TrendingUp size={16} />Income Breakdown
											</h4>
											<div class="grid gap-2">
												{#each getIncomeCategories() as category}
													{#if row.items[category] && (currency === 'EUR' ? Math.abs(row.items[category].amountInEur) : Math.abs(row.items[category].amountInGbp)) >= 0.01}
														<div class="flex justify-between items-center">
															<span class="text-sm text-muted-foreground">
																{category.replace(' and ', ' & ').replace(/([A-Z])/g, ' $1').trim()}
															</span>
															<span class="text-sm font-medium">
																{formatCell(row.items[category], currency)}
															</span>
														</div>
													{/if}
												{/each}
												<div class="border-t pt-2 flex justify-between items-center mt-2">
													<span class="text-sm font-bold">Total</span>
													<span class="text-sm font-bold text-green-600">
														{formatItemDetail(row.totalIncome, currency, true)}
													</span>
												</div>
											</div>
										</div>
									</div>
								</Popover.Content>
							</Popover.Root>
						</Table.Cell>
						<Table.Cell class="text-center border-r p-0">
							<Popover.Root>
								<Popover.Trigger class="w-full h-full p-2 hover:bg-muted/50 text-red-700">
									{formatItemDetail(row.totalExpenses, currency, true)}
								</Popover.Trigger>
								<Popover.Content class="w-80 shadow-lg">
									<div class="grid gap-3">
										<div class="space-y-2">
											<h4 class="font-medium leading-none mb-3 flex items-center gap-2">
												<TrendingDown size={16} />Expense Breakdown
											</h4>
											<div class="grid gap-2">
												{#each getExpenseCategories() as category}
													{#if row.items[category] && (currency === 'EUR' ? Math.abs(row.items[category].amountInEur) : Math.abs(row.items[category].amountInGbp)) >= 0.01}
														<div class="flex justify-between items-center">
															<span class="text-sm text-muted-foreground">
																{category.replace(' and ', ' & ').replace(/([A-Z])/g, ' $1').trim()}
															</span>
															<span class="text-sm font-medium">
																{formatCell(row.items[category], currency)}
															</span>
														</div>
													{/if}
												{/each}
												<div class="border-t pt-2 flex justify-between items-center mt-2">
													<span class="text-sm font-bold">Total</span>
													<span class="text-sm font-bold text-red-600">
														{formatItemDetail(row.totalExpenses, currency, true)}
													</span>
												</div>
											</div>
										</div>
									</div>
								</Popover.Content>
							</Popover.Root>
						</Table.Cell>
						<Table.Cell class="text-center p-2 text-blue-700">
							{formatItemDetail(getNetProfit(row.totalIncome, row.totalExpenses), currency, true)}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row class="bg-slate-100 hover:bg-slate-100">
					<Table.Cell class="text-center font-bold border-r text-slate-800">Total</Table.Cell>
					<Table.Cell class="text-center font-bold border-r text-green-700">
						{#if modelData.totalIncome}
							{formatItemDetail(modelData.totalIncome, currency, true)}
						{/if}
					</Table.Cell>
					<Table.Cell class="text-center font-bold border-r text-red-700">
						{#if modelData.totalExpenses}
							{formatItemDetail(modelData.totalExpenses, currency, true)}
						{/if}
					</Table.Cell>
					<Table.Cell class="text-center font-bold text-blue-700">
						{#if modelData.totalIncome && modelData.totalExpenses}
							{formatItemDetail(getNetProfit(modelData.totalIncome, modelData.totalExpenses), currency, true)}
						{/if}
					</Table.Cell>
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</div>
{/if}