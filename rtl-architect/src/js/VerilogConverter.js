class VerilogConverter {
	constructor(graph) {
		this.graph = graph;
	}

	// Get the transition text for a single state.  That is the case statement
	// block with the big ol' if/else if structure to choose the nextState.
	_getStateTransitionText(state) {
		let text = "\t\t" + this.graph.GetCellText(state) + ' : begin\n';
		let t_list = this.graph.GetTransitionLinks(state, { "outbound": true });

		// Trim out transitions with no target
		t_list = t_list.filter(function (x) { return x.getTargetElement() != null; });

		// Generate text
		let t_index;
		for (t_index in t_list) {
			const t = t_list[t_index];
			const condition = this.graph.GetCellText(t);
			const target = this.graph.GetCellText(t.getTargetElement());
			text += "\t\t\t";
			if (t_index != 0) { text += "else "; }
			text += "if ( " + condition + " )\n"
			text += "\t\t\t\tnextState = " + target + ";\n";
		}
		text += "\t\tend\n\n";
		return text;
	}

	// Function to get how many bits it takes to represent all of the states
	// For example, 5 states require 3 bits to represent.
	_getStateWidth() {
		var length = this.graph.GetElements().length;
		if (length <= 2)
			return 1;
		else
			return Math.ceil(Math.log2(length));
	}

	// Return a string representing the bit range, for example "[3:0]"
	_getBitRange() {
		const upper_bit = this._getStateWidth() - 1;
		if (upper_bit == 0)
			return "";
		else
			return "[" + upper_bit + ":0]";
	}
	_getEnumText() {
		let enum_text = "typedef enum bit " + this._getBitRange() + " {\n";
		const state_list = this.graph.GetElements();
		let state_index;
		for (state_index in state_list) {
			const state = state_list[state_index];
			enum_text += "\t" + this.graph.GetCellText(state) + ",\n";
		}
		enum_text = enum_text.substring(0, enum_text.length - 2) + "\n} StateType;\n\n";
		enum_text += 'StateType state;\n';
		enum_text += 'StateType nextState;\n\n';
		return enum_text;
	}

	_getTransitionText() {
		let text = "always_comb begin\n";
		text += "\tnextState = state;\n";
		text += "\tcase(state)\n";

		//for (stateName in this.stateDict){
		//  text += this.stateDict[stateName].transitionText;
		//}
		const state_list = this.graph.GetElements();
		let state_index;
		for (state_index in state_list) {
			const state = state_list[state_index];
			text += this._getStateTransitionText(state);
		}

		text += "\tendcase\n";
		text += "end\n\n";
		return text;
	}

	_getFFText(edge, reset, initial_state) {
		// Determine the edge of the clock
		let clock_edge;
		if (edge == "Positive")
			clock_edge = "posedge";
		else if (edge == "Negative")
			clock_edge = "negedge";
		else
			clock_edge = "";

		// Determine the edge of the reset
		let reset_edge;
		let reset_condition;
		if (reset == "Active High") {
			reset_edge = "posedge";
			reset_condition = "rst == 1";
		}
		else {
			reset_condition = "rst == 0";
			reset_edge = "negedge";
		}

		let text = "always_ff @(" + clock_edge + " clk, " + reset_edge + " rst) begin\n";
		text += "\tif (" + reset_condition + ")\n";
		text += "\t\tstate <= " + initial_state + ";\n";
		text += "\telse\n"
		text += "\t\tstate <= nextState\n";
		text += "end\n\n";
		return text;
	}

	_getOutputText() {
		let record;
		const state_dict = {};
		const default_state = {};
		let index;
		let state_id;
		for (index in w2ui['grid'].records) {
			record = w2ui['grid'].records[index];
			default_state[record.variable] = record['default'];
			for (state_id in record) {
				if (state_id != 'variable' && state_id != 'default' && state_id != 'changes') {
					if (!state_dict[state_id])
						state_dict[state_id] = {}
					state_dict[state_id][record.variable] = record[state_id];
				}
			}
		}
		let text = "always_comb begin\n";
		let variable;
		for (variable in default_state) {
			text += "\t" + variable + " = " + default_state[variable] + ";\n";
		}
		text += "\n\tcase(state)\n";
		for (state_id in state_dict) {
			if (state_id == 'recid')
				continue;
			const state_name = this.graph.GetCellText(this.graph.GetCell(state_id));
			text += "\t\t" + state_name + ": begin\n";
			for (variable in state_dict[state_id]) {
				const expression = state_dict[state_id][variable];
				if (expression != "") {
					text += "\t\t\t" + variable + " = " + expression + ";\n";
				}
			}
			text += "\t\tend\n\n";
		}
		text += "\tendcase\n";
		text += "end\n";
		return text;
	}

	_getVerilogHTML(edge, reset, initial_state) {
		// Build up the text part by part
		let html = this._getEnumText();
		html += this._getTransitionText();
		html += this._getFFText(edge, reset, initial_state );
		html += this._getOutputText();

		return html;
	}

	Update(edge, reset, initial_state) {
		return this._getVerilogHTML(edge, reset, initial_state);
	}
}

export default VerilogConverter;