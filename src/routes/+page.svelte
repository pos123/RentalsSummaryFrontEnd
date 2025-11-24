<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { ReportingSummary } from "@/utils/reporting-summary";
    import type { ModelParameters, SummaryModel } from "@/utils/common";

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



<Button class="text-xs" onclick={handleClick}>Click me now</Button>

{#if modelData}
<pre style="font-size: 12px;">{JSON.stringify(modelData, null, 2)}</pre>
{/if}




