// BSD License
import React from "react";

// MIT License
import SplitPane from "react-split-pane";
import "SplitPane.css";
import Button from "react-bootstrap/lib/Button";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

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

		this.graph = new JointGraph(this.PAPERWIDTH, this.PAPERHEIGHT, this._handleCellClick, this._handleNothingClick); // An IGraph object
		this.verilog_converter = new VerilogConverter(this.graph);
		this.state = {
			edge: "Positive",      // Whether the clock edge is positive, negative, or both
			reset: "Active High",  // Whether the reset signal is active high or active low
			initial_state: "",     // The name of the initial state
			verilog_text: "",      // The Verilog code that is shown in the verilog panel
			active_cell: null      // The currently active cell object
		};
	}

	componentDidMount() {
		this._initTable();
		this._initGraph();
	}

	_updateVerilog() {
		this.setState({ verilog_text: this.verilog_converter.Update(this.state.edge, this.state.reset, this.state.initial_state) });
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

		return state;
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
		return this.graph.NewTransition(source, target, name, this._handleCellChangeSource, this._handleCellChangeTarget);
	}

	// Handle changes in the source of the transition
	_handleCellChangeSource() {
		this._updateVerilog();
	}

	// Handle changes in the  target of the transition
	_handleCellChangeTarget() {
		this._updateVerilog();
	}

	// Handle clicks (mainly select active element)
	_handleCellClick(cell_view) {
		$("#paper").focus();
		this._clearActiveCell();
		const cell = this.graph.HandleCellClick(cell_view, this.ACTIVE_COLOR);
		this.setState({active_cell: cell});
	}

	// Handle clicking on nothing
	_handleNothingClick() {
		$("#paper").focus();
		this._clearActiveCell();
	}

	_initGraph() {
		s1 = this._newState(100, 100, "FOO");
		s2 = this._newState(100, 400, "BAR");
		s3 = this._newState(400, 100, "FOO_2");
		s4 = this._newState(400, 400, "BAR_2");

		this._newTransition(s1, s2, "(x == y) || (z < w)");
		this._newTransition(s4, s3, "z[2] == x");
		this._newTransition(s3, s1, "(z[2] == y) && (x != y)");
		this._newTransition(s2, s4, "w & z & !x");
		this._newTransition(s4, s1, "z | w | (z ^ x)");
		this._updateVerilog();


		/*****************************************************************************
		* Event handlers
		*****************************************************************************/

		$("#paper").on("keydown", function (event) {
			switch (event.which) {
				case 46: // Delete key
					this._deleteState(this.state.active_cell); break;
				case 83: // Letter s 
					if (event.ctrlKey && event.shiftKey) {
						this._newState(this.PAPERWIDTH / 2, this.PAPERHEIGHT / 2, "NEW_STATE");
						event.preventDefault();
					}
					break;
				case 65: // Letter a 
					if (event.ctrlKey && event.shiftKey) {
						this._newTransition({ x: this.PAPERWIDTH / 4, y: this.PAPERHEIGHT / 4 }, { x: this.PAPERWIDTH * 3 / 4, y: this.PAPERHEIGHT * 3 / 4 }, 'x==1 && y==0');
						event.preventDefault();
					}
					break;
				case 8:
					this._editActiveCellString(null); break;
			}
		});

		$("#paper").on("keypress", function(event) {
			console.log(event.originalEvent);
			if ((event.keyCode || event.which) == 32)
				event.preventDefault();
			str = String.fromCharCode(event.keyCode || event.which);
			if (event.key.length == 1) {
				this._editActiveCellString(event.key);
				this._updateGrid();
			}
		});
	}

	_initTable() {
		const update = this._updateVerilog;
		$('#grid').w2grid({
			name: 'grid',
			show: {
				toolbar: true,
				footer: false,
				toolbarSave: false,
			},
			columns: [
				{
					field: 'variable', caption: 'Variable Name', size: '120px', sortable: true, resizable: true,
					editable: { type: 'text' }
				},
				{
					field: 'default', caption: 'Default Value', size: '120px', sortable: true, resizable: true,
					editable: { type: 'text' }
				},
			],
			toolbar: {
				items: [
					{ id: 'add', type: 'button', caption: 'Add Record', icon: 'w2ui-icon-plus' }
				],
				onClick: function (event) {
					if (event.target == 'add') {
						w2ui.grid.add({ recid: w2ui.grid.records.length + 1, variable: "VAR" + (w2ui.grid.records.length + 1), 'default': 0 });
					}
				}
			},
			records: [
				{ recid: 1, variable: 'Y', default: 0 },
			],

			onChange: function (event) {
				event.onComplete = function (event) {
					this.save();
					update();
				}
			}
		});

		// Re-implement save and merge function because the built in implementation
		// doesn't like field names with dashes in them
		w2ui['grid'].save = function () {
			changes = this.getChanges();
			for (cIndex in this.getChanges()) {
				change = changes[cIndex];
				record = this.get(change.recid);
				for (item in change) {
					if (item != 'recid')
						record[item] = change[item];
				}
				delete record.changes;
			}
		}
		w2ui['grid'].refresh();
	}

	// This should be called whenever the grid tab is opened. It updates the state names.
	// TO BE REMOVED
	_updateGrid() {
		stateList = this.graph.graph.getElements();
		var stateDict = {};
		for (index in stateList) {
			state = stateList[index];
			stateDict[state.id] = this.graph.GetCellText(state);
		}
		for (columnIndex in w2ui['grid'].columns.slice(0, -2)) {
			columnIndex = Number(columnIndex) + 2;
			w2ui['grid'].columns[columnIndex].caption = stateDict[w2ui['grid'].columns[columnIndex].field];
		}
		w2ui['grid'].refresh();
	}

	render() {
		return (
			<SplitPane split="vertical" minSize={100}
					defaultSize={document.documentElement.clientWidth / 2}
					primary="second">
				<div className="window">
						<h2>Next State Logic</h2>
						<div id="paper" className="paper"></div>
						<div id="grid"></div>
				</div>
				<div className="window">
					<h2>Verilog Code</h2>
					<div id="verilog">{this.state.verilog_text}</div>
				</div>
			</SplitPane>
		);
	}
};

export default BodyPane;