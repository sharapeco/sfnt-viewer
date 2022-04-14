import { TYPE, defs, POS } from './sfnt-defs';

export class SFNT {
	/**
	 *
	 * @param {ArrayBuffer} buffer
	 */
	constructor(buffer) {
		this.buffer = buffer
		this.view = new DataView(buffer)
	}

	/**
	 * テーブル定義を取得する
	 *
	 * defs[type] が関数なら、DataView と offset から定義を取得する関数を呼び出し、その戻り値を使用する
	 *
	 * @param {string} type
	 * @param {number} offset
	 * @returns {?Def[]}
	 */
	getDefsByType(type, offset) {
		switch (typeof defs[type]) {
			case 'object':
				return defs[type];
			case 'function':
				return defs[type](this.view, offset);
			default:
				return undefined;
		}
	}

	/**
	 * 指定した offset のテーブル情報を読み取り、Block 形式で返す
	 *
	 * @param {number} offset
	 * @param {string} type
	 * @return {Block} ブロック
	 */
	parse(offset, type) {
		const defValues = this.getDefsByType(type, offset);
		if (!defValues) {
			return {
				name: type,
				values: [{
					size: 8,
					offset,
					type: 'unknown',
					label: 'unknown',
					content: '',
					extraClass: 'unknown',
				}]
			}
		}

		/** @type {Value[]} */
		const values = [];

		/** @type {number} カーソル位置 */
		let position = offset;

		for (let def of defValues) {
			if (def.repetition == null) {
				const value = this.readValue(position, def, values);

				if (def.link && [TYPE.Offset16, TYPE.Offset32].includes(value.type)) {
					const linkOffset = value.content + (
						def.link.pos === POS.file ? 0 : offset
					);
					const linkType = def.link.typeBy
						? values.find((v) => v.label === def.link.typeBy)?.content
						: def.link.type;
					if (linkType != null) {
						value.link = {
							type: linkType,
							offset: linkOffset
						};
					}
				}

				values.push(value);
				position += value.size;
			} else {
				// データ定義に repetition が含まれる場合、
				// そのラベルのついた値の分だけ繰り返すデータとして扱う
				const n = (typeof def.repetition === "number")
					? def.repetition
					: values.find((value) => value.label === def.repetition)?.content;
				if (n == null || n < 0) {
					throw new Error('Parse error');
				}
				for (let i = 0; i < n; i++) {
					if (TYPE[def.type]) {
						const value = this.readValue(position, def, values);
						values.push(value);
						position += value.size;
					} else {
						const children = this.parse(position, def.type);
						for (let value of children.values) {
							values.push({ ...value, extraClass: `repetition-${i % 2 === 0 ? 'odd' : 'even'}` });
							position += value.size;
						}
					}
				}
			}
		}
		return {
			name: type,
			values
		};
	}

	/**
	 * 値を読み込む
	 * @param {number} offset
	 * @param {Definition} def
	 * @param {Value[]} context 文字列型の場合は長さの指定が必要
	 * @returns {Value}
	 */
	readValue(offset, def, context) {
		switch (def.type) {
			case TYPE.int8:
				return {
					...def,
					offset,
					size: 1,
					content: this.view.getInt8(offset)
				};
			case TYPE.int16:
			case TYPE.FWORD:
				return {
					...def,
					offset,
					size: 2,
					content: this.view.getInt16(offset, false)
				};
			case TYPE.int32:
				return {
					...def,
					offset,
					size: 4,
					content: this.view.getInt32(offset, false)
				};
			case TYPE.uint8:
				return {
					...def,
					offset,
					size: 1,
					content: this.view.getUint8(offset)
				};
			case TYPE.uint16:
			case TYPE.UFWORD:
			case TYPE.Offset16:
				return {
					...def,
					offset,
					size: 2,
					content: this.view.getUint16(offset, false)
				};
			case TYPE.uint32:
			case TYPE.Offset32:
				return {
					...def,
					offset,
					size: 4,
					content: this.view.getUint32(offset, false)
				};
			case TYPE.Fixed:
				return {
					...def,
					offset,
					size: 4,
					content: `${this.view.getInt32(offset, false) / (2 ** 16)}`
				};
			case TYPE.F2DOT14:
				return {
					...def,
					offset,
					size: 2,
					content: `${this.view.getInt16(offset, false) / (2 ** 2)}`
				};
			case TYPE.Version16Dot16:
				const major = this.view.getUint16(offset, false);
				const minor = this.view.getUint16(offset + 2, false) >> 12;
				return {
					...def,
					offset,
					size: 4,
					content: `${major}.${minor}`
				};
			case TYPE.LONGDATETIME:
				return {
					...def,
					offset,
					size: 8,
					content: '準備中'
				};
			case TYPE.Tag:
				return {
					...def,
					offset,
					size: 4,
					content: [0, 1, 2, 3].map((p) => (
						String.fromCharCode(this.view.getUint8(offset + p))
					)).join('')
				};
			case TYPE.string:
				return {
					...def,
					offset,
					size: 4,
					content: this.buffer.substring(offset, offset + 4)
				};
			default:
				throw new Error('Type error');
		}
	}
};
