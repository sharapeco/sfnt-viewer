<script>
	/**
	 * テーブルを表示するためのコンポーネント
	 */

	 import { createEventDispatcher } from 'svelte';
	import { divideValues } from './utils';

	/** @type {Block} */
	export let block;

	const dispatch = createEventDispatcher();

	/**
	 * @param {Link} link
	 */
	const openLink = (link) => {
		dispatch('link', link);
	};

	/**
	 * Numberの値を指定したバイト数で16進ダンプする
	 * @param {number} value
	 * @param {number} size
	 */
	const hexDump = (value, size) => {
		const uval = (value < 0) ? (2 ** (8 * size)) + value : value;
		return '0x'.concat(uval.toString(16).toUpperCase().padStart(2 * size, '0'));
	};
</script>

<div class="block block-{block.name}">
	{#each divideValues(block.values) as line}
		<div class="line">
			{#each line.values as value}
				<div
					class="value byte-{value.size} {value.extraClass || ''} {value.link ? 'clickable' : ''}"
					tabindex={value.link ? '0' : undefined}
					on:click={value.link ? openLink(value.link) : undefined}
					title={value.description}
				>
					<span class="offset">{value.offset.toString(16).toUpperCase()}</span>
					<span class="type">{value.type}</span>
					<span class="label">{value.label}</span>
					<span class="content">
						{#if typeof value.content === 'number'}
						{hexDump(value.content, value.size)}
						<small>({value.content})</small>
						{:else}
						{value.content}
						{/if}
					</span>
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.block {
		display: flex;
		flex-direction: column;
		gap: 1px;
		border: solid 1px var(--bd);
		width: calc(4 * var(--width-per-byte));
	}

	.line {
		display: flex;
		justify-content: space-between;
		gap: 1px;
	}

	.value {
		position: relative;
		padding: 0.5em;
		line-height: 1.2;
		background: var(--value-bg);
	}
	.value.repetition-odd {
		background-color: var(--value-rep-bg);
	}
	.value.repetition-even {
		background-color: var(--value-rep-bg-alt);
	}
	.value.unknown {
		background-color: var(--value-unk-bg);
	}

	.value.clickable {
		color: var(--link-fg);
		cursor: pointer;
	}
	.value.clickable::after {
		content: "";
		display: block;
		position: absolute;
		inset: 0;
	}
	.value.clickable:hover::after,
	.value.clickable:focus-visible::after {
		background-color: rgba(0, 0, 0, .08);
	}

	.value small {
		opacity: 0.5;
	}

	.type,
	.label {
		font-size: 75%;
		opacity: 0.7;
	}

	.offset {
		position: absolute;
		top: -0.5em;
		right: 100%;
		font-size: 70%;
		line-height: 1;
		opacity: 0.5;
	}
	.value:not(:first-of-type) .offset {
		display: none;
	}

	.byte-1 {
		flex: 1;
	}
	.byte-2 {
		flex: 2;
	}
	.byte-3 {
		flex: 3;
	}
	.byte-4 {
		flex: 4;
	}
	.byte-8 {
		flex: 4;
		height: 4.4em;
	}
</style>
