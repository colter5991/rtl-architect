// BSD License
import React from "react";

// MIT License
import SplitPane from "react-split-pane";
import "SplitPane.css";
import Button from "react-bootstrap/lib/Button";

// My Loads
import "BodyPane.css";
import VerilogConverter from "./VerilogConverter";
import JointGraph from "./JointGraph";

// ReSharper disable once PossiblyUnassignedProperty
class BodyPane extends React.Component {
	constructor(props) {
		super(props);

		// Constants
		this.INACTIVE_COLOR = "black"; // The outline color of inactive graph elements
		this.ACTIVE_COLOR = "blue";    // outline color of the active element
		this.PAPERWIDTH = 800;
		this.PAPERHEIGHT = 600;

		this.graph = new JointGraph(); // An IGraph object
		this.verilog_converter = new VerilogConverter(this.graph);
		this.state = {
			edge: "Positive",      // Whether the clock edge is positive, negative, or both
			reset: "Active High",  // Whether the reset signal is active high or active low
			initial_state: "",     // The name of the initial state
			verilog_text: "",      // The Verilog code that is shown in the verilog panel
			active_cell: null      // The currently active cell object
		};
	}

	_updateVerilog() {
		this.setState({ verilog_text: this.verilog_converter.Update(this.edge, this.reset, this.initial_state) });
	}

	_newState(xpos, ypos, name) {
		const state = this.graph.NewState(xpos, ypos, name);
		this._updateVerilog();

		w2ui['grid'].columns.push({
			field: state.id, caption: name, size: '120px', sortable: true, resizable: true,
			editable: { type: 'text' }
		});

		recordList = w2ui['grid'].records;
		for (index in recordList) {
			record = recordList[index];
			record[state.id] = "";
		}
	}

	_deleteState(state) {
		for (index in w2ui['grid'].columns) {
			if (w2ui['grid'].columns[index].field == state.id) {
				w2ui['grid'].columns.splice(index, 1);
				break;
			}
		}
		for (index in w2ui['grid'].records) {
			delete w2ui['grid'].records[index][state.id];
		}

		this.graph.DeleteState(state);
		this._updateVerilog();
	}

	_editActiveCellString(character) {
		this.graph.EditActiveCellString(character, this.state.active_cell);
		this._updateVerilog();
	}

	// inactivate the current active cell
	_clearActiveCell() {
		if (this.state.active_cell)
			this.graph.SetCellStroke(this.state.active_cell, this.INACTIVE_COLOR);
		this.setState({ active_cell: null });
	}

	_newTransition(source, target, name) {
		return this.graph.NewTransition(source, target, name, this._updateVerilog);
	}

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