<script lang="ts">
	import type { ItemDetail } from '@/utils/common';
	import { formatItemDetail } from '@/utils/common';

	interface Props {
		totalIncome: ItemDetail;
		totalExpenses: ItemDetail;
		currency: 'GBP' | 'EUR';
	}

	let { totalIncome, totalExpenses, currency }: Props = $props();

	function getNetIncome(income: ItemDetail, expenses: ItemDetail): ItemDetail {
		return {
			amountInGbp: income.amountInGbp - expenses.amountInGbp,
			amountInEur: income.amountInEur - expenses.amountInEur,
			identifiers: []
		};
	}
</script>

<!-- Headline Figures -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
	<div class="p-4 border rounded-lg bg-muted/20">
		<div class="text-sm font-medium text-muted-foreground mb-1">Total Income</div>
		<div class="text-2xl font-bold text-green-600">
			{formatItemDetail(totalIncome, currency, true)}
		</div>
	</div>
	<div class="p-4 border rounded-lg bg-muted/20">
		<div class="text-sm font-medium text-muted-foreground mb-1">Total Expenses</div>
		<div class="text-2xl font-bold text-red-600">
			{formatItemDetail(totalExpenses, currency, true)}
		</div>
	</div>
	<div class="p-4 border rounded-lg bg-muted/20">
		<div class="text-sm font-medium text-muted-foreground mb-1">Total Net Income</div>
		<div class="text-2xl font-bold">
			{formatItemDetail(getNetIncome(totalIncome, totalExpenses), currency, true)}
		</div>
	</div>
</div>