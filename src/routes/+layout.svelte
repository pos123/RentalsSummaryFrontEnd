<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Building2 } from '@lucide/svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Header -->
<div class="layout-header">
	<div class="header-content">
		<div class="logo-section">
			<div class="glow">
				<Building2 size={20}/>
			</div>
			<div class="logo-text text-foreground">
				<p>Rental Summary</p>
			</div>
		</div>
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

	.logo-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-right: 1rem;
	}

	.logo-text p {
		margin: 0;
		font-family: 'Inter', sans-serif;
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		line-height: 1.2;
		text-transform: uppercase;
		text-shadow: 0 0 8px rgba(100, 116, 139, 0.15),
		             0 0 4px rgba(100, 116, 139, 0.1);
	}
	
	.glow {
		filter: drop-shadow(0 0 10px rgba(100, 116, 139, 0.4))
	        drop-shadow(0 0 5px rgba(100, 116, 139, 0.25));
			opacity: 0.9;
	}
</style>

{@render children()}