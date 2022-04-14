/**
 * Valueの配列を n バイトごとに分割する
 *
 * データが n-byte alignment になっている想定なので、
 * 行をはみ出すデータはきちんと処理されない。
 *
 * @param {Value[]} values
 * @param {number} size
 * @return {Line[]}
 */
export const divideValues = (values, size = 4) => {
	/** @type {Line[]} */
	const lines = [];
	let li = -1;
	for (let value of values) {
		if (li < 0 || lines[li].values.reduce((sum, value) => sum + value.size, 0) >= size) {
			lines.push({ values: [] });
			li++;
		}
		lines[li].values.push(value);
	}
	return lines
};
