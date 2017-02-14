class VerilogConverter {
	constructor(edge, reset, initial_state, graph) {
		this.edge = edge; // Whether the clock edge is positive, negative, or both
		this.reset = reset; // Whether the reset signal is active high or active low
		this.init = initial_state; // The name of the initial state
		this.graph = graph;
	}

	// Get the transition text for a single state.  That is the case statement
	// block with the big ol' if/else if structure to choose the nextState.
	_getStateTransitionText(state) {
		var text = "\t\t" + getCellText(state) + ' : begin\n'
		tList = this.graph.getConnectedLinks(state, { "outbound": true });

		// Trim out transitions with no target
		tList = tList.filter(function (x) { return x.getTargetElement() != null; });

		// Generate text
		for (tIndex in tList) {
			t = tList[tIndex];
			condition = getCellText(t);
			target = getCellText(t.getTargetElement());
			text += "\t\t\t"
			if (tIndex != 0) { text += "else "; }
			text += "if ( " + condition + " )\n"
			text += "\t\t\t\tnextState = " + target + ";\n"
		}
		text += "\t\tend\n\n"
		return text;
	}

	// Function to get how many bits it takes to represent all of the states
	// For example, 5 states require 3 bits to represent.
	_getStateWidth() {
		var length = this.graph.getElements().length;
		if (length <= 2)
			return 1;
		else
			return Math.ceil(Math.log2(length));
	}

	// Return a string representing the bit range, for example "[3:0]"
	_getBitRange() {
		upperBit = this.getStateWidth() - 1;
		if (upperBit == 0)
			return ""
		else
			return "[" + upperBit + ":0]"
	}

	_getEnumText() {
		enumText = "typedef enum bit " + this.getBitRange() + " {\n"
		stateList = this.graph.getElements()
		for (stateIndex in stateList) {
			state = stateList[stateIndex];
			enumText += "\t" + getCellText(state) + ",\n"
		}
		enumText = enumText.substring(0, enumText.length - 2) + "\n} StateType;\n\n";
		enumText += 'StateType state;\n';
		enumText += 'StateType nextState;\n\n';
		return enumText;
	}

	_getTransitionText() {
		text = "always_comb begin\n";
		text += "\t nextState = state;\n";
		text += "\t case(state)\n";

		//for (stateName in this.stateDict){
		//  text += this.stateDict[stateName].transitionText;
		//}
		stateList = this.graph.getElements()
		for (stateIndex in stateList) {
			state = stateList[stateIndex];
			text += this.getStateTransitionText(state);
		}

		text += "\tendcase\n"
		text += "end\n\n"
		return text;
	}

	_getFFText() {
		// Determine the edge of the clock
		if (this.edge == "Positive")
			clockEdge = "posedge";
		else if (this.edge == "Negative")
			clockEdge = "negedge";
		else
			clockEdge = "";

		// Determine the edge of the reset
		if (this.reset == "Active High") {
			resetEdge = "posedge";
			resetCondition = "rst == 1";
		}
		else {
			resetCondition = "rst == 0";
			resetEdge = "negedge";
		}

		text = "always_ff @(" + clockEdge + " clk, " + resetEdge + " rst) begin\n"
		text += "\tif (" + resetCondition + ");\n";
		text += "\t\tstate <= " + this.init + ";\n";
		text += "\telse\n"
		text += "\t\tstate <= nextState\n";
		text += "end\n\n";
		return text;
	}

	_getOutputText() {
		var record;
		stateDict = {};
		defaultState = {};
		for (index in w2ui['grid'].records) {
			record = w2ui['grid'].records[index];
			defaultState[record.variable] = record['default'];
			for (stateID in record) {
				if (stateID != 'variable' && stateID != 'default' && stateID != 'changes') {
					if (!stateDict[stateID])
						stateDict[stateID] = {}
					stateDict[stateID][record.variable] = record[stateID];
				}
			}
		}
		var text = "always_comb begin\n";
		for (var variable in defaultState) {
			text += "\t" + variable + " = " + defaultState[variable] + ";\n";
		}
		text += "\n\tcase(state)\n";
		for (var stateID in stateDict) {
			if (stateID == 'recid')
				continue;
			stateName = getCellText(this.graph.getCell(stateID));
			text += "\t\t" + stateName + ": begin\n"
			for (var variable in stateDict[stateID]) {
				var expression = stateDict[stateID][variable];
				if (expression != "") {
					text += "\t\t\t" + variable + " = " + expression + ";\n"
				}
			}
			text += "\t\tend\n\n";
		}
		text += "\tendcase\n"
		text += "end\n\n"
		return text;
	}

	GetVerilogHTML() {
		// Build up the text part by part
		html = this.getEnumText();
		html += this.getTransitionText();
		html += this.getFFText();
		html += this.getOutputText();

		// Convert to a nice html format
		html = html.replace(new RegExp('\n', 'g'), '<br>');
		html = html.replace(new RegExp('\t', 'g'), '&nbsp&nbsp&nbsp&nbsp');
		return html;
	}

	Update() {
		html = this.getVerilogHTML();
		document.getElementById("verilog").innerHTML = html;
	}
}

export default VerilogConverter;