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
		var length = this.graph.GetStates().length;
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
		const state_list = this.graph.GetStates();
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
		const state_list = this.graph.GetStates();
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

	// Get the output text for a single state.
	_getStateOutputText(state) {
		let text = `\t\t${this.graph.GetCellText(state)} : begin\n`;
		let t_list = this.graph.GetOutputLinks(state, { "outbound": true });

		// Trim out transitions with no target
		t_list = t_list.filter(function (x) { return x.getTargetElement() !== null; });

		let t_index;
		const condition_target_list = {};
		// Group output conditions;
		for (t_index in t_list) {
			if (t_list.hasOwnProperty(t_index)) {
				const t = t_list[t_index];
				let condition = this.graph.GetCellText(t);
				const target = this.graph.GetCellText(t.getTargetElement());

				if (condition === "") {
					condition = "default";
				}
				
				if (condition_target_list.hasOwnProperty(condition)) {
					condition_target_list[condition] += `\n\t\t\t\t${target};`;
				} else {
					condition_target_list[condition] = target + ";";
				}
			}
		}

		if (condition_target_list.hasOwnProperty("default")) {
			text += `\t\t\t${condition_target_list["default"]}\n`;
		}

		// Generate text
		let first = true;
		for (t_index in condition_target_list) {
			if (condition_target_list.hasOwnProperty(t_index)) {
				if (t_index === "default") {
					continue;
				}
				text += "\t\t\t";
				if (!first) {
					text += "else ";
				}
				first = false;
				text += `if ( ${t_index} ) begin:\n`;
				text += `\t\t\t\t${condition_target_list[t_index]}\n`;
				text += "\t\t\tend\n";
			}
		}
		text += "\t\tend\n\n";
		return text;
	}

	_getOutputText() {
		let text = "always_comb begin\n";
		text += "\n\tcase(state)\n";

		// Create output states
		const state_list = this.graph.GetStates();
		let state_index;
		for (state_index in state_list) {
			if (state_list.hasOwnProperty(state_index)) {
				const state = state_list[state_index];
				text += this._getStateOutputText(state);
			}
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