<script>
	import Dropzone from "svelte-file-dropzone";
	import BlockView from "./BlockView.svelte";
	import { SFNT } from "./sfnt";

	/** @type {import('./types').Block} */

	/** @type {?File} */
	let file = undefined;

	/** @type {?SFNT}*/
	let sfnt = undefined;

	/** @type {Block[]} */
	let stack = [];

	const handleFilesSelect = async (e) => {
		const { acceptedFiles } = e.detail;
		if (acceptedFiles.length === 1) {
			file = acceptedFiles[0];
			sfnt = new SFNT(await file.arrayBuffer())
			stack = [sfnt.parse(0, 'SFNT')];
		}
	};

	const handleLink = (e) => {
		/** @type {Link} */
		const link = e.detail;
		stack = [...stack, sfnt.parse(link.offset, link.type)];
	};

	const navigate = (index) => {
		if (index < stack.length - 1) {
			stack = stack.slice(0, index + 1);
		}
	};
</script>

<header>
	<h1>SFNT Viewer</h1>
</header>
<main>
	{#if file == null}
	<Dropzone
		accept=".otf,.ttf,.ttc"
		on:drop={handleFilesSelect}
	/>
	{:else}
	<ol class="stack">
		{#each stack as block, blockIndex}
		<li>
			<button on:click={() => navigate(blockIndex)}>{block.name}</button>
		</li>
		{/each}
	</ol>
	{#if stack.length >= 1}
	<BlockView
		block={stack[stack.length - 1]}
		on:link={handleLink}
	/>
	{/if}
	{/if}
</main>

<style>
	header {
		color: #eee;
		background: #555;
	}

	h1 {
		padding: 0.25em 1em;
		font-size: 100%;
		font-weight: 700;
	}

	main {
		flex: 1;
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	.stack {
		display: flex;
		list-style: none;
		padding: .5em;
		background-color: #f4f4f4;
	}

	.stack li:not(:last-of-type)::after {
		content: " >";
		margin-right: .25em;
		opacity: 0.5;
	}

	button {
		position: relative;
		margin: -.25em;
		padding: .25em;
		border: 0;
		border-radius: .25em;
	}
	button::after {
		content: "";
		display: block;
		position: absolute;
		inset: 0;
		border-radius: .25em;
	}
	button:hover::after,
	button:focus-visible::after {
		background-color: rgba(0, 0, 0, .08);
	}
</style>
