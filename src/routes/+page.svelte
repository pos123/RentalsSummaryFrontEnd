<script lang="ts">
	import { ReportingSummary } from '@/utils/reporting-summary';
	import type { ModelParameters, SummaryModel } from '@/utils/common';

  import { Cable } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	let modelData!: SummaryModel;

	const handleClick = async () => {
		let parameters: ModelParameters = {
			periodName: 'FR: 2025',
			chippenhamAllocation: 100,
			meadowcroftAllocation: 100
		};

		var reportingSummary = new ReportingSummary();
		modelData = await reportingSummary.getModelData(parameters);
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
      <input type="number" id="chippenhamAllocation" class="w-full p-2 border text-sm rounded-sm"/>
    </Card.Content>
	</Card.Root>
</div>

<!-- <Button class="text-xs" onclick={handleClick}>Click me now</Button> -->
