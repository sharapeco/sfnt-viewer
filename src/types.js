/**
 * テーブル定義
 * @typedef {Object} Def
 * @property {string} type テーブル名
 * @property {string} label
 * @property {?string} description 値の説明
 * @property {?LinkDef} link type = Offset16 | Offset32 のとき、この値を他のテーブルへの参照として扱う
 */

/**
 * リンク定義
 * @typedef {Object} LinkDef
 * @property {?string} type テーブル名
 * @property {?string} typeBy テーブル名が入っているデータのラベル
 * @property {string} pos "file" | "table"
 */

/**
 * テーブルデータ
 *
 * データの塊は全部「テーブル」と呼んでいるようなので Table でよかったかも
 * @typedef {Object} Block
 * @property {string} name
 * @property {Value[]} values
 */

/**
 * 値
 * @typedef {Object} Value
 * @property {number} size
 * @property {number} offset
 * @property {string} type
 * @property {string} label
 * @property {string|number} content
 * @property {?string} description 値の説明
 * @property {?string} extraClass 表示のための追加CSSクラス文字列
 * @property {?Link} link 他のブロックへのリンク
 */

/**
 * @typedef {Object} Link
 * @property {string} type テーブル名
 * @property {number} offset
 */

/**
 * n-byte alignment で表示する際の1行分のデータの集まり
 * @typedef {Object} Line
 * @property {Value[]} values
 */
