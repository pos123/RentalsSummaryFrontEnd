<script lang="ts">
	import { ReportingSummary } from '@/utils/reporting-summary';
	import type { ModelParameters, SummaryModel, ValueLabel } from '@/utils/common';
	import { getTaxYearFilterValues } from '@/utils/common';


  	import { Cable, Play, Loader2, BarChart3, Package } from '@lucide/svelte';
  	import { Button } from '$lib/components/ui/button/index.js';
  	import { Label } from '$lib/components/ui/label/index.js';
  	import * as Card from '$lib/components/ui/card/index.js';
  	import * as Select from "$lib/components/ui/select/index.js";
  	import { Switch } from "$lib/components/ui/switch/index.js";
  	import * as Table from "$lib/components/ui/table/index.js";
 import * as Popover from "$lib/components/ui/popover/index.js";
  	import { formatItemDetail } from '@/utils/common';
  	import type { ItemDetail, RentalItem } from '@/utils/common';
  
  	
  	let taxYearSelection: string = $state("")
	const triggerTaxYearContent = $derived(
		getTaxYearFilterValues().find((f) => f.value === taxYearSelection)?.label ?? "Select a tax year"
	);

	let chippenhamAllocation: string = $state("100");
	let meadowcroftAllocation: string = $state("100");

	let modelData: SummaryModel = $state({} as SummaryModel);
	let isGenerating: boolean = $state(false);
	let isEur = $state(false);
	let currency: 'GBP' | 'EUR' = $derived(isEur ? 'EUR' : 'GBP');

	function getNetIncome(income: ItemDetail | undefined, expenses: ItemDetail | undefined): ItemDetail {
		return {
			amountInGbp: (income?.amountInGbp ?? 0) - (expenses?.amountInGbp ?? 0),
			amountInEur: (income?.amountInEur ?? 0) - (expenses?.amountInEur ?? 0),
			identifiers: []
		};
	}

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

	const handleClick = async () => {
		isGenerating = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 250)); // Artificial delay
			let parameters: ModelParameters = {
				periodName: taxYearSelection,
				chippenhamAllocation: parseInt(chippenhamAllocation) as 0 | 50 | 100,
				meadowcroftAllocation: parseInt(meadowcroftAllocation) as 0 | 100
			};

			var reportingSummary = new ReportingSummary();
			modelData = await reportingSummary.getModelData(parameters);
		} finally {
			isGenerating = false;
		}
	};


</script>

<div class="w-full p-5">
	<Card.Root class="w-full rounded-sm">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
        		<Cable size={16}/>Inputs
      		</Card.Title>
			<Card.Description>provide tax year and allocation of meadowcroft and chippenham</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-wrap gap-4">
				<!-- tax year filter -->
				<Select.Root type="single" name="taxYearSelection" bind:value={taxYearSelection} disabled={isGenerating}>
					<Select.Trigger class="w-[200px]">
						{triggerTaxYearContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>UK tax years</Select.Label>
							{#each getTaxYearFilterValues() as valueLabel}
								{#if valueLabel.value.startsWith("UK")}
									<Select.Item value={valueLabel.value}>{valueLabel.label}</Select.Item>
								{/if}
							{/each}
						</Select.Group>
						<Select.Group>
							<Select.Label>FR tax years</Select.Label>
							{#each getTaxYearFilterValues() as valueLabel}
								{#if valueLabel.value.startsWith("FR")}
									<Select.Item value={valueLabel.value}>{valueLabel.label}</Select.Item>
								{/if}
							{/each}
						</Select.Group>

					</Select.Content>
				</Select.Root>

				<!-- chippenham allocation -->
				<Select.Root type="single" bind:value={chippenhamAllocation} disabled={isGenerating}>
					<Select.Trigger class="w-[200px]">
						Chippenham: {chippenhamAllocation}%
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="0">0%</Select.Item>
						<Select.Item value="50">50%</Select.Item>
						<Select.Item value="100">100%</Select.Item>
					</Select.Content>
				</Select.Root>

				<!-- meadowcroft allocation -->
				<Select.Root type="single" bind:value={meadowcroftAllocation} disabled={isGenerating}>
					<Select.Trigger class="w-[200px]">
						Meadowcroft: {meadowcroftAllocation}%
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="0">0%</Select.Item>
						<Select.Item value="100">100%</Select.Item>
					</Select.Content>
				</Select.Root>

				<Button onclick={handleClick} disabled={taxYearSelection === "" || 
														(chippenhamAllocation === "0" && meadowcroftAllocation === "0") 
														|| isGenerating } 
														class="bg-green-600 text-white hover:bg-green-700 
														disabled:opacity-50 disabled:cursor-not-allowed">
					{#if isGenerating}
						<Loader2 size={16} class="animate-spin" />
						Summarising data... 
					{:else}
						<Play size={16} />
						Summarise
					{/if}
				</Button>
			</div>

		</Card.Content>
	</Card.Root>

	{#if taxYearSelection !== "" && modelData.success}
		<Card.Root class="w-full rounded-sm mt-4 transition-opacity duration-300 {isGenerating ? 'opacity-0' : 'opacity-100'}">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="flex items-center gap-2">
					<BarChart3 size={16} /> Summary
				</Card.Title>
				<div class="flex items-center space-x-2">
					<Label for="currency-mode">GBP</Label>
					<Switch id="currency-mode" bind:checked={isEur} />
					<Label for="currency-mode">EUR</Label>
				</div>
			</Card.Header>
			<Card.Content>
				
				<!-- Headline Figures -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
					<div class="p-4 border rounded-lg bg-muted/20">
						<div class="text-sm font-medium text-muted-foreground mb-1">Total Income</div>
						<div class="text-2xl font-bold text-green-600">
							{formatItemDetail(modelData.totalIncome!, currency, true)}
						</div>
					</div>
					<div class="p-4 border rounded-lg bg-muted/20">
						<div class="text-sm font-medium text-muted-foreground mb-1">Total Expenses</div>
						<div class="text-2xl font-bold text-red-600">
							{formatItemDetail(modelData.totalExpenses!, currency, true)}
						</div>
					</div>
					<div class="p-4 border rounded-lg bg-muted/20">
						<div class="text-sm font-medium text-muted-foreground mb-1">Total Net Income</div>
						<div class="text-2xl font-bold">
							{formatItemDetail(getNetIncome(modelData.totalIncome, modelData.totalExpenses), currency, true)}
						</div>
					</div>
				</div>

				<!-- Period Breakdown Table -->
				{#if modelData.periodBreakdownData && modelData.header}
					<div class="rounded-md border">
						<Table.Root class="text-base">
							<Table.Header>
								<Table.Row>
									<Table.Head class="text-center w-[100px] border-r font-bold">Period</Table.Head>
									{#each modelData.header as header}
										<Table.Head class="text-center border-r last:border-r-0 font-bold">{header.replace(' and ', ' & ')}</Table.Head>
									{/each}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each Object.values(modelData.periodBreakdownData).sort((a, b) => a.period.localeCompare(b.period)) as row}
									<Table.Row>
										<Table.Cell class="text-center font-medium border-r">{row.period}</Table.Cell>
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

			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- <Button class="text-xs" onclick={handleClick}>Click me now</Button> -->
