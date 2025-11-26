<script lang="ts">
	import { ReportingSummary } from '@/utils/reporting-summary';
	import type { ModelParameters, SummaryModel, ValueLabel } from '@/utils/common';
	import { getTaxYearFilterValues } from '@/utils/common';


  	import { Cable, Play, Loader2, BarChart3 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from "$lib/components/ui/select/index.js";

	
	let taxYearSelection: string = $state("")
	const triggerTaxYearContent = $derived(
		getTaxYearFilterValues().find((f) => f.value === taxYearSelection)?.label ?? "Select a tax year"
	);

	let chippenhamAllocation: string = $state("100");
	let meadowcroftAllocation: string = $state("100");

	let modelData: SummaryModel = $state({} as SummaryModel);
	let isGenerating: boolean = $state(false);

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

				<Button onclick={handleClick} disabled={taxYearSelection === "" || isGenerating} class="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<BarChart3 size={16} /> Summary
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<!-- Summary content will go here -->
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- <Button class="text-xs" onclick={handleClick}>Click me now</Button> -->
