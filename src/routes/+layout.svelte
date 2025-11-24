<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Home, Building2 } from '@lucide/svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Header -->
 <div class="layout-header">
	<div class="title">
		<!-- Replace 'home' with your icon name -->
		<Building2 size={48} style="color: silver;"/>
		<span>RENTALS SUMMARY</span>
	</div>
	<div class="line"></div>
</div>


<style>
	.layout-header {
		margin-left: 0.5rem;
		margin-top: 0.5rem;
		margin-bottom: 2rem;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: 'TikTok Sans', sans-serif;
		font-size: 2.0rem;
		font-weight: 600;
		color: slategrey;
	}

	.line {
		height: 2px;
		background-color: #e5e7eb;
		margin-top: 0.5rem;
		margin-left: 0.25rem;
		margin-right: 0.25rem;
	}
</style>


{@render children()}
