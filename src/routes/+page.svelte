<script lang="ts">
	import { ReportingSummary } from '@/utils/reporting-summary';
	import type { ModelParameters, SummaryModel } from '@/utils/common';
	import { getTaxYearFilterValues } from '@/utils/common';
	import PeriodBreakdownTable from '$lib/components/PeriodBreakdownTable.svelte';
	import HeadlineFigures from '$lib/components/HeadlineFigures.svelte';

  	import { Cable, Loader2, BarChart3 } from '@lucide/svelte';
  	import { Label } from '$lib/components/ui/label/index.js';
  	import * as Card from '$lib/components/ui/card/index.js';
  	import * as Select from "$lib/components/ui/select/index.js";
  	import { Switch } from "$lib/components/ui/switch/index.js";
  
  	
  	let taxYearSelection: string = $state("")
	const triggerTaxYearContent = $derived(
		taxYearSelection == "ALL_UK" ? "All UK tax years"
			: taxYearSelection == "ALL_FR" ? "All FR tax years"
			: getTaxYearFilterValues().find((f) => f.value === taxYearSelection)?.label ?? "Select a tax year"	
		);

	let chippenhamAllocation: string = $state("100");
	let meadowcroftAllocation: string = $state("100");

	let modelData: SummaryModel = $state({} as SummaryModel);
	let isGenerating: boolean = $state(false);
	let isEur = $state(false);
	let currency: 'GBP' | 'EUR' = $derived(isEur ? 'EUR' : 'GBP');

	$effect(() => {
		console.log('Chippenham allocation changed to:', chippenhamAllocation);
		console.log('Meadowcroft allocation changed to:', meadowcroftAllocation);
		console.log('Tax year changed to:', taxYearSelection);
		
		// Auto-trigger the summary generation when inputs are valid
		if (taxYearSelection !== "" &&
			!(chippenhamAllocation === "0" && meadowcroftAllocation === "0")) {
			handleClick();
		} else {
			modelData = {} as SummaryModel;
		}
	});



	const handleClick = async () => {
		isGenerating = true;
		try {
			await new Promise(resolve => setTimeout(resolve, 10)); // Artificial delay
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
        		<Cable size={16} class="text-blue-600"/>Inputs
      		</Card.Title>
			<Card.Description>Choose period and allocation of chippenham and meadowcroft.</Card.Description>
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
						
						<!-- Misc -->
						<Select.Group>
							<Select.Label>Misc</Select.Label>
							<Select.Item value="ALL_UK">All UK tax years</Select.Item>
							<Select.Item value="ALL_FR">All FR tax years</Select.Item>
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

				<!-- Auto-generation progress indicator -->
				{#if isGenerating}
					<div class="flex items-center gap-2 h-10 px-4 bg-green-50 border border-green-200 rounded-sm -mt-0.5">
						<Loader2 size={18} class="animate-spin text-green-600" />
						<span class="text-sm font-medium text-green-700">Generating summary...</span>
					</div>
				{/if}
			</div>

		</Card.Content>
	</Card.Root>

	{#if taxYearSelection !== "" && modelData.success}
		<Card.Root class="w-full rounded-sm mt-4 transition-opacity duration-300 {isGenerating ? 'opacity-0' : 'opacity-100'}">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="flex items-center gap-2">
					<BarChart3 size={16} class="text-purple-600" /> Summary
				</Card.Title>
				<div class="flex items-center space-x-2">
					<Label for="currency-mode" class="text-lg">🇬🇧</Label>
					<Switch id="currency-mode" bind:checked={isEur} />
					<Label for="currency-mode" class="text-lg">🇫🇷</Label>
				</div>
			</Card.Header>
			<Card.Content>
				
				<!-- Headline Figures -->
				<HeadlineFigures totalIncome={modelData.totalIncome!} totalExpenses={modelData.totalExpenses!} {currency} />

				<!-- Period Breakdown Table -->
				<PeriodBreakdownTable {modelData} {currency} />

			</Card.Content>
		</Card.Root>
	{/if}
</div>
