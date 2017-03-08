var React = require("react");

module.exports = function (data, filename) {
	const blob = new Blob([data], { type: "text/csv" });
	if (typeof window.navigator.msSaveBlob !== "undefined") {
		// IE workaround for "HTML7007: One or more blob URLs were 
		// revoked by closing the blob for which they were created. 
		// These URLs will no longer resolve as the data backing 
		// the URL has been freed."
		window.navigator.msSaveBlob(blob, filename);
	}
	else {
		const csv_url = window.URL.createObjectURL(blob);
		const temp_link = document.createElement("a");
		temp_link.href = csv_url;
		temp_link.setAttribute("download", filename);
		temp_link.setAttribute("target", "_blank");
		document.body.appendChild(temp_link);
		temp_link.click();
		document.body.removeChild(temp_link);
	}
}