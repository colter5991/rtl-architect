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

	// CREDIT: Gavin Kistner - http://phrogz.net/js/wheeldelta.html
	static WheelDistance(evt) {
		if (!evt) evt = event;
		const w = evt.wheelDelta;
		const d = evt.detail;
		if (d){
			if (w) return w/d/40*d>0?1:-1; // Opera
			else return -d/3;              // Firefox;
		} else return w/120;             // IE/Safari/Chrome
	}

	// CREDIT: Gavin Kistner - http://phrogz.net/js/wheeldelta.html
	static WheelDirection(evt) {
		if (!evt) evt = event;
		return (evt.detail<0) ? 1 : (evt.wheelDelta>0) ? 1 : -1;
	}
}

export default Utils;