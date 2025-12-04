export function hebrewNumerals(numerals: number): string {
	if (!numerals) {
		return '';
	}
	const hArray0_9 = ['', '\u05d0', '\u05d1', '\u05d2', '\u05d3', '\u05d4', '\u05d5', '\u05d6', '\u05d7', '\u05d8'];
	const hArray10_19 = [
		'\u05d9',
		'\u05d9\u05d0',
		'\u05d9\u05d1',
		'\u05d9\u05d2',
		'\u05d9\u05d3',
		'\u05d8\u05d5',
		'\u05d8\u05d6',
		'\u05d9\u05d6',
		'\u05d9\u05d7',
		'\u05d9\u05d8',
	];
	const hArray20_90 = ['', '', '\u05db', '\u05dc', '\u05de', '\u05e0', '\u05e1', '\u05e2', '\u05e4', '\u05e6'];
	const hArray100_900 = [
		'',
		'\u05e7',
		'\u05e8',
		'\u05e9',
		'\u05ea',
		'\u05ea\u05e7',
		'\u05ea\u05e8',
		'\u05ea\u05e9',
		'\u05ea\u05ea',
		'\u05ea\u05ea\u05e7',
	];
	const hArray1000_9000 = [
		'',
		'\u05d0',
		'\u05d1',
		'\u05d1\u05d0',
		'\u05d1\u05d1',
		'\u05d4',
		'\u05d4\u05d0',
		'\u05d4\u05d1',
		'\u05d4\u05d1\u05d0',
		'\u05d4\u05d1\u05d1',
	];
	const geresh = '\u05f3',
		gershaim = '\u05f4';
	let mem = 0;
	let result: string[] = [];
	let step = 0;
	while (numerals > 0) {
		let m = numerals % 10;
		if (step === 0) {
			mem = m;
		} else if (step === 1) {
			if (m !== 1) {
				result.unshift(hArray20_90[m], hArray0_9[mem]);
			} else {
				result.unshift(hArray10_19[mem]);
			}
		} else if (step === 2) {
			result.unshift(hArray100_900[m]);
		} else {
			if (m !== 5) {
				result.unshift(hArray1000_9000[m], geresh, ' ');
			}
			break;
		}
		numerals = Math.floor(numerals / 10);
		if (step === 0 && numerals === 0) {
			result.unshift(hArray0_9[m]);
		}
		step++;
	}
	result = result.join('').split('');
	if (result.length === 1) {
		result.push(geresh);
	} else if (result.length > 1) {
		result.splice(result.length - 1, 0, gershaim);
	}
	return result.join('');
}