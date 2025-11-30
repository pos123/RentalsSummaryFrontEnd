<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Building2, BarChart3 } from '@lucide/svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Header -->
<div class="layout-header">
	<div class="header-content">
		<h3 class="glow text-lg font-bold tracking-tight flex items-center gap-2">
			<BarChart3 class="glow h-6 w-6 text-primary" />
			Financial Summary
		</h3>
	</div>
</div>

<style>
	.layout-header {
		margin-right: 0.5rem;
		margin-top: 0.5rem;
		margin-left: 0;
	}

	.header-content {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding-left: 1rem;
	}

	.glow {
		filter: drop-shadow(0 0 10px rgba(100, 116, 139, 0.4))
	        drop-shadow(0 0 5px rgba(100, 116, 139, 0.25));
			opacity: 0.9;
	}
</style>

{@render children()}