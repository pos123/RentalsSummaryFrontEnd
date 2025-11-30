<script lang="ts">
	import type { ItemDetail } from '@/utils/common';
	import { formatItemDetail } from '@/utils/common';
	import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card/index.js';


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

	let netIncome = $derived(getNetIncome(totalIncome, totalExpenses));
	let isPositive = $derived((currency === 'GBP' ? netIncome.amountInGbp : netIncome.amountInEur) >= 0);
</script>

<!-- Headline Figures -->
<!-- Headline Figures -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
	<div class="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-white p-3 shadow-sm">
		<div class="flex items-center gap-1.5 mb-0.5">
			<span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Income</span>
		</div>
		<div class="text-xl font-bold text-green-700 tracking-tight">
			{formatItemDetail(totalIncome, currency, true)}
		</div>
	</div>

	<div class="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-white p-3 shadow-sm">
		<div class="flex items-center gap-1.5 mb-0.5">
			<span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Expenses</span>
		</div>
		<div class="text-xl font-bold text-red-700 tracking-tight">
			{formatItemDetail(totalExpenses, currency, true)}
		</div>
	</div>

	<div class="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm">
		<div class="flex items-center gap-1.5 mb-0.5">
			<span class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Net Income</span>
		</div>
		<div class="text-xl font-bold tracking-tight {isPositive ? 'text-blue-700' : 'text-red-600'}">
			{formatItemDetail(netIncome, currency, true)}
		</div>
	</div>
</div>