// BSD License
import React from "react";

// MPL 2.0 License
import Joint from "jointjs";

// MIT License
import SplitPane from "react-split-pane";
import "SplitPane.css";
import Button from "react-bootstrap/lib/Button";

// My loads
import "BodyPane.css";
import VerilogConverter from "./VerilogConverter";
import JointGraph from "./JointGraph";

// ReSharper disable once PossiblyUnassignedProperty
class BodyPane extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			edge: "Positive",      // Whether the clock edge is positive, negative, or both
			reset: "Active High",  // Whether the reset signal is active high or active low
			initial_state: "",              // The name of the initial state
			verilog_converter: new VerilogConverter(new JointGraph(Joint.dia.Graph()))
		};
	},
	// Get the transition text for a single state.  That is the case statement
	// block with the big ol' if/else if structure to choose the nextState.
	getStateTransitionText(state) {
		let text = `\t\t${getCellText(state)} : begin\n`;
		// ReSharper disable once PossiblyUnassignedProperty
		let t_list = this.state.graph.getConnectedLinks(state, { "outbound": true });

		// Trim out transitions with no target
		t_list = t_list.filter(function (x) { return x.getTargetElement() != null; });

		// Generate text
		for (let t_index in t_list) {
			if (t_list.hasOwnProperty(t_index)) {
				const t = t_list[t_index];
				const condition = getCellText(t);
				target = getCellText(t.getTargetElement());
				text += "\t\t\t"
				if (t_index != 0) {
					text += "else ";
				}
				text += "if ( " + condition + " )\n"
				text += "\t\t\t\tnextState = " + target + ";\n"
			}
		}
		text += "\t\tend\n\n"
		return text;
	},
	// Get the text of the given cell
	getCellText = function (state) {
		if (!state)
			return null;
		if (state.attributes.type == "fsa.State")
			return state.attr("text/text");
		else
			return state.label(0).attrs.text.text;
	},
	render() {
		return (
			<SplitPane split="vertical" minSize={100}
					defaultSize={document.documentElement.clientWidth / 2}
					primary="second">
				<div className="window">
						<h2>Next State Logic</h2>
						<div id="paper" className="paper"></div>
				</div>
				<div className="window">
					<h2>Verilog Code</h2>
					<div id="verilog"></div>
				</div>
			</SplitPane>
		);
	}
};

//<div>
//						<h2>Output Logic</h2>
//						<p>Click 'Add Record' to add a new output variable</p>
//						<p>Specify the value for each output variable for each state.  Using all constants results in a Moore machine, and using expressions
//						dependent on input variables results in a mealy machine.</p>
//						<p>An output variable will assume the default value for all states in which the value is not specified</p>
//						<div id="grid"></div>
//					</div>

export default BodyPane;