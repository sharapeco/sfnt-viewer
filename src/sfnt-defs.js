export const TYPE = {
	int8: 'int8',
	int16: 'int16',
	int32: 'int32',
	uint8: 'int8',
	uint16: 'uint16',
	uint24: 'uint24',
	uint32: 'uint32',
	Fixed: 'Fixed', // 符号付き整数 16 bit + 小数 16 bit
	F2DOT14: 'F2DOT14', // 符号付き整数 2 bit + 小数 14 bit
	Version16Dot16: 'Version16Dot16', // バージョン番号
	LONGDATETIME: 'LONGDATETIME', // 8 byte, 1904-01-01 00:00:00 からの経過秒
	Offset16: 'Offset16', // = uint16
	Offset32: 'Offset32', // = uint32
	FWORD: 'FWORD', // = int16
	UFWORD: 'UFWORD', // = uint16
	Tag: 'Tag', // char[4]
	string: 'string' // UTF-16BE string
};

export const POS = {
	file: 'file',
	table: 'table',
};

export const defs = {
	SFNT: [
		{ type: TYPE.uint32, label: 'sfntVersion', description: '0x00010000 or 0x4F54544F ("OTTO")' },
		{ type: TYPE.uint16, label: 'numTables', description: 'Number of tables.' },
		{ type: TYPE.uint16, label: 'searchRange', description: 'Maximum power of 2 less than or equal to numTables, times 16 ((2**floor(log2(numTables))) * 16, where “**” is an exponentiation operator).' },
		{ type: TYPE.uint16, label: 'entrySelector', description: 'Log₂ of the maximum power of 2 less than or equal to numTables (log₂(searchRange/16), which is equal to floor(log₂(numTables))).' },
		{ type: TYPE.uint16, label: 'rangeShift', description: 'numTables times 16, minus searchRange ((numTables * 16) - searchRange).' },
		{ type: 'TableRecord', label: 'tableRecords', repetition: 'numTables', description: 'Table records array—one for each top-level table in the font' }
	],
	TableRecord: [
		{ type: TYPE.Tag, label: 'tableTag', description: 'Table identifier.' },
		{ type: TYPE.uint32, label: 'checksum', description: 'Checksum for this table.' },
		{ type: TYPE.Offset32, link: { typeBy: 'tableTag', pos: POS.file }, label: 'offset', description: 'Offset from beginning of font file.' },
		{ type: TYPE.uint32, label: 'length', description: 'Length of this table.' }
	],
	cmap: [
		{ type: TYPE.uint16, label: 'version', description: 'Table version number (0).' },
		{ type: TYPE.uint16, label: 'numTables', description: 'Number of encoding tables that follow.' },
		{ type: 'EncodingRecord', label: 'encodingRecords', repetition: 'numTables' },
	],
	EncodingRecord: [
		{ type: TYPE.uint16, label: 'platformID', description: 'Platform ID.' },
		{ type: TYPE.uint16, label: 'encodingID', description: 'Platform-specific encoding ID.' },
		{ type: TYPE.Offset32, link: { type: 'cmapSub', pos: POS.table }, label: 'subtableOffset', description: 'Byte offset from beginning of table to the subtable for this encoding.' },
	],
	/**
	 * @param {DataView} view
	 * @param {number} offset
	 */
	cmapSub: (view, offset) => {
		const format = view.getUint16(offset, false);
		if ([0, 2, 4, 6, 8, 10, 12, 13, 14].includes(format)) {
			return defs[`cmapSub (${format})`];
		} else {
			return undefined;
		}
	},
	'cmapSub (0)': [
		{ type: TYPE.uint16, label: 'format', description: 'Format number is set to 0.' },
		{ type: TYPE.uint16, label: 'length', description: 'This is the length in bytes of the subtable.' },
		{ type: TYPE.uint16, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint8, repetition: 256, label: 'glyphIdArray[256]', description: 'An array that maps character codes to glyph index values.' },
	],
	'cmapSub (2)': [
		{ type: TYPE.uint16, label: 'format', description: 'Format number is set to 2.' },
		{ type: TYPE.uint16, label: 'length', description: 'This is the length in bytes of the subtable.' },
		{ type: TYPE.uint16, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint16, label: 'subHeaderKeys[256]', description: 'Array that maps high bytes to subHeaders: value is subHeader index × 8.' },
		{ type: 'SubHeader', label: 'subHeaders[]', description: 'Variable-length array of SubHeader records.' },
		{ type: TYPE.uint16, label: 'glyphIdArray[]', description: 'Variable-length array containing subarrays used for mapping the low byte of 2-byte characters.' },
	],
	SubHeader: [
		{ type: TYPE.uint16, label: 'firstCode', description: 'First valid low byte for this SubHeader.' },
		{ type: TYPE.uint16, label: 'entryCount', description: 'Number of valid low bytes for this SubHeader.' },
		{ type: TYPE.int16, label: 'idDelta', description: 'See text below.' },
		{ type: TYPE.uint16, label: 'idRangeOffset', description: 'See text below.' },
	],
	'cmapSub (4)': [
		{ type: TYPE.uint16, label: 'format', description: 'Format number is set to 4.' },
		{ type: TYPE.uint16, label: 'length', description: 'This is the length in bytes of the subtable.' },
		{ type: TYPE.uint16, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint16, label: 'segCountX2', description: '2 × segCount.' },
		{ type: TYPE.uint16, label: 'searchRange', description: 'Maximum power of 2 less than or equal to segCount, times 2 ((2**floor(log2(segCount))) * 2, where “**” is an exponentiation operator)' },
		{ type: TYPE.uint16, label: 'entrySelector', description: 'Log2 of the maximum power of 2 less than or equal to numTables (log2(searchRange/2), which is equal to floor(log2(segCount)))' },
		{ type: TYPE.uint16, label: 'rangeShift', description: 'segCount times 2, minus searchRange ((segCount * 2) - searchRange)' },
		{ type: TYPE.uint16, label: 'endCode[segCount]', description: 'End characterCode for each segment, last=0xFFFF.' },
		{ type: TYPE.uint16, label: 'reservedPad', description: 'Set to 0.' },
		{ type: TYPE.uint16, label: 'startCode[segCount]', description: 'Start character code for each segment.' },
		{ type: TYPE.int16, label: 'idDelta[segCount]', description: 'Delta for all character codes in segment.' },
		{ type: TYPE.uint16, label: 'idRangeOffsets[segCount]', description: 'Offsets into glyphIdArray or 0' },
		{ type: TYPE.uint16, label: 'glyphIdArray[]', description: 'Glyph index array (arbitrary length)' },
	],
	'cmapSub (6)': [
		{ type: TYPE.uint16, label: 'format', description: 'Format number is set to 6.' },
		{ type: TYPE.uint16, label: 'length', description: 'This is the length in bytes of the subtable.' },
		{ type: TYPE.uint16, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint16, label: 'firstCode', description: 'First character code of subrange.' },
		{ type: TYPE.uint16, label: 'entryCount', description: 'Number of character codes in subrange.' },
		{ type: TYPE.uint16, repetition: 'entryCount', label: 'glyphIdArray[entryCount]', description: 'Array of glyph index values for character codes in the range.' },
	],
	'cmapSub (8)': [
		{ type: TYPE.uint16, label: 'format', description: 'Subtable format; set to 8.' },
		{ type: TYPE.uint16, label: 'reserved', description: 'Reserved; set to 0' },
		{ type: TYPE.uint32, label: 'length', description: 'Byte length of this subtable (including the header)' },
		{ type: TYPE.uint32, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint8, label: 'is32[8192]', description: 'Tightly packed array of bits (8K bytes total) indicating whether the particular 16-bit (index) value is the start of a 32-bit character code' },
		{ type: TYPE.uint32, label: 'numGroups', description: 'Number of groupings which follow' },
		{ type: 'SequentialMapGroup', label: 'groups[numGroups]', description: 'Array of SequentialMapGroup records.' },
	],
	SequentialMapGroup: [
		{ type: TYPE.uint32, label: 'startCharCode', description: 'First character code in this group; note that if this group is for one or more 16-bit character codes (which is determined from the is32 array), this 32-bit value will have the high 16-bits set to zero' },
		{ type: TYPE.uint32, label: 'endCharCode', description: 'Last character code in this group; same condition as listed above for the startCharCode' },
		{ type: TYPE.uint32, label: 'startGlyphID', description: 'Glyph index corresponding to the starting character code' },
	],
	'cmapSub (10)': [
		{ type: TYPE.uint16, label: 'format', description: 'Subtable format; set to 10.' },
		{ type: TYPE.uint16, label: 'reserved', description: 'Reserved; set to 0' },
		{ type: TYPE.uint32, label: 'length', description: 'Byte length of this subtable (including the header)' },
		{ type: TYPE.uint32, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint32, label: 'startCharCode', description: 'First character code covered' },
		{ type: TYPE.uint32, label: 'numChars', description: 'Number of character codes covered' },
		{ type: TYPE.uint16, label: 'glyphIdArray[]', description: 'Array of glyph indices for the character codes covered' },
	],
	'cmapSub (12)': [
		{ type: TYPE.uint16, label: 'format', description: 'Subtable format; set to 12.' },
		{ type: TYPE.uint16, label: 'reserved', description: 'Reserved; set to 0' },
		{ type: TYPE.uint32, label: 'length', description: 'Byte length of this subtable (including the header)' },
		{ type: TYPE.uint32, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint32, label: 'numGroups', description: 'Number of groupings which follow' },
		{ type: 'SequentialMapGroup', label: 'groups[numGroups]', description: 'Array of SequentialMapGroup records.' },
	],
	'cmapSub (13)': [
		{ type: TYPE.uint16, label: 'format', description: 'Subtable format; set to 13.' },
		{ type: TYPE.uint16, label: 'reserved', description: 'Reserved; set to 0' },
		{ type: TYPE.uint32, label: 'length', description: 'Byte length of this subtable (including the header)' },
		{ type: TYPE.uint32, label: 'language', description: 'For requirements on use of the language field, see “Use of the language field in "cmap" subtables” in this document.' },
		{ type: TYPE.uint32, label: 'numGroups', description: 'Number of groupings which follow' },
		{ type: 'ConstantMapGroup', label: 'groups[numGroups]', description: 'Array of ConstantMapGroup records.' },
	],
	ConstantMapGroup: [
		{ type: TYPE.uint32, label: 'startCharCode', description: 'First character code in this group' },
		{ type: TYPE.uint32, label: 'endCharCode', description: 'Last character code in this group' },
		{ type: TYPE.uint32, label: 'glyphID', description: 'Glyph index to be used for all the characters in the group’s range.' },
	],
	'cmapSub (14)': [
		{ type: TYPE.uint16, label: 'format', description: 'Subtable format. Set to 14.' },
		{ type: TYPE.uint32, label: 'length', description: 'Byte length of this subtable (including this header)' },
		{ type: TYPE.uint32, label: 'numVarSelectorRecords', description: 'Number of variation Selector Records' },
		{ type: 'VariationSelector', label: 'varSelector[numVarSelectorRecords]', description: 'Array of VariationSelector records.' },
	],
	VariationSelector: [
		{ type: TYPE.uint24, label: 'varSelector', description: 'Variation selector' },
		{ type: TYPE.Offset32, label: 'defaultUVSOffset', description: 'Offset from the start of the format 14 subtable to Default UVS Table. May be 0.' },
		{ type: TYPE.Offset32, label: 'nonDefaultUVSOffset', description: 'Offset from the start of the format 14 subtable to Non-Default UVS Table. May be 0.' },
	],
	head: [
		{ type: TYPE.uint16, label: 'majorVersion', description: 'Major version number of the font header table — set to 1.' },
		{ type: TYPE.uint16, label: 'minorVersion', description: 'Minor version number of the font header table — set to 0.' },
		{ type: TYPE.Fixed, label: 'fontRevision', description: 'Set by font manufacturer.' },
		{ type: TYPE.uint32, label: 'checksumAdjustment', description: 'To compute: set it to 0, sum the entire font as uint32, then store 0xB1B0AFBA - sum. If the font is used as a component in a font collection file, the value of this field will be invalidated by changes to the file structure and font table directory, and must be ignored.' },
		{ type: TYPE.uint32, label: 'magicNumber', description: 'Set to 0x5F0F3CF5.' },
		{ type: TYPE.uint16, label: 'flags', description: '(https://docs.microsoft.com/ja-jp/typography/opentype/spec/head)' },
		{ type: TYPE.uint16, label: 'unitsPerEm', description: 'Set to a value from 16 to 16384. Any value in this range is valid. In fonts that have TrueType outlines, a power of 2 is recommended as this allows performance optimizations in some rasterizers.' },
		{ type: TYPE.LONGDATETIME, label: 'created', description: 'Number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone.' },
		{ type: TYPE.LONGDATETIME, label: 'modified', description: 'Number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone.' },
		{ type: TYPE.int16, label: 'xMin', description: 'Minimum x coordinate across all glyph bounding boxes.' },
		{ type: TYPE.int16, label: 'yMin', description: 'Minimum y coordinate across all glyph bounding boxes.' },
		{ type: TYPE.int16, label: 'xMax', description: 'Maximum x coordinate across all glyph bounding boxes.' },
		{ type: TYPE.int16, label: 'yMax', description: 'Maximum y coordinate across all glyph bounding boxes.' },
		{ type: TYPE.uint16, label: 'macStyle', description: '(https://docs.microsoft.com/ja-jp/typography/opentype/spec/head)' },
		{ type: TYPE.uint16, label: 'lowestRecPPEM', description: 'Smallest readable size in pixels.' },
		{ type: TYPE.int16, label: 'fontDirectionHint', description: 'Deprecated (https://docs.microsoft.com/ja-jp/typography/opentype/spec/head).' },
		{ type: TYPE.int16, label: 'indexToLocFormat', description: '0 for short offsets (Offset16), 1 for long (Offset32).' },
		{ type: TYPE.int16, label: 'glyphDataFormat', description: '0 for current format.' }
	],
	hhea: [
		{ type: TYPE.uint16, label:'majorVersion', description: 'Major version number of the horizontal header table — set to 1.' },
		{ type: TYPE.uint16, label:'minorVersion', description: 'Minor version number of the horizontal header table — set to 0.' },
		{ type: TYPE.FWORD, label:'ascender', description: 'Typographic ascent—see note below.' },
		{ type: TYPE.FWORD, label:'descender', description: 'Typographic descent—see note below.' },
		{ type: TYPE.FWORD, label:'lineGap', description: `Typographic line gap.
Negative LineGap values are treated as zero in some legacy platform implementations.` },
		{ type: TYPE.UFWORD, label:'advanceWidthMax', description: 'Maximum advance width value in "hmtx" table.' },
		{ type: TYPE.FWORD, label:'minLeftSideBearing', description: 'Minimum left sidebearing value in "hmtx" table for glyphs with contours (empty glyphs should be ignored).' },
		{ type: TYPE.FWORD, label:'minRightSideBearing', description: 'Minimum right sidebearing value; calculated as min(aw - (lsb + xMax - xMin)) for glyphs with contours (empty glyphs should be ignored).' },
		{ type: TYPE.FWORD, label:'xMaxExtent', description: 'Max(lsb + (xMax - xMin)).' },
		{ type: TYPE.int16, label:'caretSlopeRise', description: 'Used to calculate the slope of the cursor (rise/run); 1 for vertical.' },
		{ type: TYPE.int16, label:'caretSlopeRun', description: '0 for vertical.' },
		{ type: TYPE.int16, label:'caretOffset', description: 'The amount by which a slanted highlight on a glyph needs to be shifted to produce the best appearance. Set to 0 for non-slanted fonts' },
		{ type: TYPE.int16, label: '(reserved)', description: 'set to 0' },
		{ type: TYPE.int16, label: '(reserved)', description: 'set to 0' },
		{ type: TYPE.int16, label: '(reserved)', description: 'set to 0' },
		{ type: TYPE.int16, label: '(reserved)', description: 'set to 0' },
		{ type: TYPE.int16, label:'metricDataFormat', description: '0 for current format.' },
		{ type: TYPE.uint16, label:'numberOfHMetrics', description: 'Number of hMetric entries in "hmtx" table' },
	],
	/**
	 * @param {DataView} view
	 * @param {number} offset
	 */
	maxp: (view, offset) => {
		const version = view.getUint32(offset, false);
		if (version === 0x00010000) {
			return defs['maxp (1.0)'];
		} else {
			return defs['maxp (0.5)'];
		}
	},
	'maxp (0.5)': [
		{ type: TYPE.Version16Dot16, label: 'version', description: '0x00005000 for version 0.5' },
		{ type: TYPE.uint16, label: 'numGlyphs', description: 'The number of glyphs in the font.' }
	],
	'maxp (1.0)': [
		{ type: TYPE.Version16Dot16, label: 'version', description: '0x00010000 for version 1.0.' },
		{ type: TYPE.uint16, label: 'numGlyphs', description: 'The number of glyphs in the font.' },
		{ type: TYPE.uint16, label: 'maxPoints', description: 'Maximum points in a non-composite glyph.' },
		{ type: TYPE.uint16, label: 'maxContours', description: 'Maximum contours in a non-composite glyph.' },
		{ type: TYPE.uint16, label: 'maxCompositePoints', description: 'Maximum points in a composite glyph.' },
		{ type: TYPE.uint16, label: 'maxCompositeContours', description: 'Maximum contours in a composite glyph.' },
		{ type: TYPE.uint16, label: 'maxZones', description: '1 if instructions do not use the twilight zone (Z0), or 2 if instructions do use Z0; should be set to 2 in most cases.' },
		{ type: TYPE.uint16, label: 'maxTwilightPoints', description: 'Maximum points used in Z0.' },
		{ type: TYPE.uint16, label: 'maxStorage', description: 'Number of Storage Area locations.' },
		{ type: TYPE.uint16, label: 'maxFunctionDefs', description: 'Number of FDEFs, equal to the highest function number + 1.' },
		{ type: TYPE.uint16, label: 'maxInstructionDefs', description: 'Number of IDEFs.' },
		{ type: TYPE.uint16, label: 'maxStackElements', description: 'Maximum stack depth across Font Program ("fpgm" table), CVT Program ("prep" table) and all glyph instructions (in the "glyf" table).' },
		{ type: TYPE.uint16, label: 'maxSizeOfInstructions', description: 'Maximum byte count for glyph instructions.' },
		{ type: TYPE.uint16, label: 'maxComponentElements', description: 'Maximum number of components referenced at “top level” for any composite glyph.' },
		{ type: TYPE.uint16, label: 'maxComponentDepth', description: 'Maximum levels of recursion; 1 for simple components.' },
	]
};
