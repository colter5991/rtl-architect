class Utils {
	static GetLongestLine(str) {
		/// Returns the longest line in the string
		const split_str = str.split(/\r|\n/);

		let max_length = 0;
		for (let line in split_str) {
			if (split_str.hasOwnProperty(line)) {
				if (split_str[line].length > max_length) {
					max_length = split_str[line].length;
				}
			}
		}

		return max_length;
	}

	static CountLines(str) {
		const split_str = str.split(/\r|\n/);

		return split_str.length;
	}

	static SplitLinesRejoin(str, rejoin_pattern) {
		return str.split(/\r|\n/).join(rejoin_pattern);
	}
}

export default Utils;