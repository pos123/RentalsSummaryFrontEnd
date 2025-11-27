<script lang="ts">
	import type { SummaryModel, ItemDetail, RentalItem } from '@/utils/common';
	import { formatItemDetail } from '@/utils/common';
	import * as Table from "$lib/components/ui/table/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Package } from '@lucide/svelte';

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

	function getRentalItems(identifiers: string[]): RentalItem[] {
		if (!modelData.rentalItemMap) return [];
		return identifiers.map(id => modelData.rentalItemMap![id]).filter(item => item !== undefined);
	}
</script>

{#if modelData.periodBreakdownData && modelData.header}
	<div class="rounded-md border">
		<Table.Root class="text-sm">
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-center w-[100px] border-r">Period</Table.Head>
					{#each modelData.header as header}
						<Table.Head class="text-center border-r last:border-r-0">{header.replace(' and ', ' & ')}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each Object.values(modelData.periodBreakdownData).sort((a, b) => a.period.localeCompare(b.period)) as row}
					<Table.Row>
						<Table.Cell class="text-center  border-r">{row.period}</Table.Cell>
						{#each modelData.header as header}
							<Table.Cell class="text-center border-r last:border-r-0 p-0">
								{#if row.items[header] && (currency === 'EUR' ? Math.abs(row.items[header].amountInEur) : Math.abs(row.items[header].amountInGbp)) >= 0.01}
									<Popover.Root>
										<Popover.Trigger class="w-full h-full p-2 hover:bg-muted/50">
											{formatCell(row.items[header], currency)}
										</Popover.Trigger>
										<Popover.Content class="w-auto p-0">
											<div class="grid gap-4">
												<div class="space-y-2">
													<h4 class="font-medium leading-none p-4 pb-0 flex items-center gap-2"><Package size={16} />Items</h4>
													<Table.Root>
														<Table.Header>
															<Table.Row>
																<Table.Head class="font-bold">Property</Table.Head>
																<Table.Head class="font-bold">Date</Table.Head>
																<Table.Head class="font-bold">Description</Table.Head>
																<Table.Head class="text-right font-bold">Amount (GBP)</Table.Head>
															</Table.Row>
														</Table.Header>
														<Table.Body>
															{#each getRentalItems(row.items[header].identifiers) as item}
																<Table.Row>
																	<Table.Cell>{item.property.toLowerCase()}</Table.Cell>
																	<Table.Cell>{item.date.toLocaleDateString()}</Table.Cell>
																	<Table.Cell>{item.description}</Table.Cell>
																	<Table.Cell class="text-right">
																		{item.amount.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}
																	</Table.Cell>
																</Table.Row>
															{/each}
														</Table.Body>
													</Table.Root>
												</div>
											</div>
										</Popover.Content>
									</Popover.Root>
								{/if}
							</Table.Cell>
						{/each}
					</Table.Row>
				{/each}
			</Table.Body>
			<Table.Footer>
				<Table.Row>
					<Table.Cell class="text-center font-bold border-r">Total</Table.Cell>
					{#each modelData.header as header}
						<Table.Cell class="text-center font-bold border-r last:border-r-0">
							{#if modelData.categorySummaryData}
								{formatCell(modelData.categorySummaryData[header], currency)}
							{/if}
						</Table.Cell>
					{/each}
				</Table.Row>
			</Table.Footer>
		</Table.Root>
	</div>
{/if}