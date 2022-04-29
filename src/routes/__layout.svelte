<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async ({ url }) => {
		const href = url.href;
		return { stuff: { href } };
	};
</script>

<script lang="ts">
	import '../app.scss';
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	$: href = browser ? $page.stuff.href : undefined;
</script>

<svelte:head>
	<link rel="alternate" hreflang="en" {href} />
	<link rel="canonical" {href} />
</svelte:head>
<div class="inhold-wrapper">
	<slot />
</div>

<style lang="scss">
	.inhold-wrapper {
		width: -webkit-fill-available; /* For Firefox */
		width: -moz-available; /* For Chrome */
		min-height: 100vh;
		min-height: -webkit-fill-available;
		max-width: 60rem;
		margin: auto;
	}
</style>
