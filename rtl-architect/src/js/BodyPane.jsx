// BSD License
import React from "react";
import ReactDOM from 'react-dom';

// MIT License
import SplitPane from "react-split-pane";
import "SplitPane.css";
import Button from "react-bootstrap/lib/Button";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import Overlay from "react-bootstrap/lib/Overlay";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import SettingsMenu from "./SettingsMenu"
// MIT License
import {ReactElementResize} from "react-element-resize";
//import jQuery from "jquery";
//window.$ = window.jQuery = jQuery;

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
		this.INACTIVE_OUTPUT_COLOR = "green";
		this.PAPERWIDTH = 400;
		this.PAPERHEIGHT = 600;

		this._handleCellClick = this._handleCellClick.bind(this);
		this._handleNothingClick = this._handleNothingClick.bind(this);
		this._handleResizeWindow = this._handleResizeWindow.bind(this);
		this._handleKeyPress = this._handleKeyPress.bind(this);
		this._handleKeyDown = this._handleKeyDown.bind(this);
		this._handleDragStart = this._handleDragStart.bind(this);
		this._handleDrag = this._handleDrag.bind(this);
		this._handleMouseUp = this._handleMouseUp.bind(this);
		this._handleScroll = this._handleScroll.bind(this);
		this._updateVerilog = this._updateVerilog.bind(this);
		this._handleEditTitleInput = this._handleEditTitleInput.bind(this);
		this._handleDoubleClick = this._handleDoubleClick.bind(this);
		this._handleToggleMenu = this._handleToggleMenu.bind(this);
		this._handleClockEdge = this._handleClockEdge.bind(this);
		this._handleReset = this._handleReset.bind(this);
		this._handleInitialState = this._handleInitialState.bind(this);
		this._handleFileNameChange = this._handleFileNameChange.bind(this);
		this._getStateNames = this._getStateNames.bind(this);
		
		window.onresize = this._handleResizeWindow;

		this.graph = null;
		this.verilog_converter = null;
		this.state = {
			edge: "Positive",      // Whether the clock edge is positive, negative, or both
			reset: "Active High",  // Whether the reset signal is active high or active low
			initial_state: "FOO",     // The name of the initial state
			verilog_text: "",      // The Verilog code that is shown in the verilog panel
			active_cell: null,      // The currently active cell object
			drag_mouse_x: 0,
			drag_mouse_y: 0,
			dragging: false,
			scale: 1,
			show_settings: false,
			file_name: ""
		};
	}

	componentDidMount() {
		// This must be performed after the object has mounted
		this.graph = new JointGraph(document.getElementById("paper").offsetWidth, document.documentElement.clientHeight - 199,
			this._handleCellClick, this._handleNothingClick, this._handleDoubleClick, this._updateVerilog); // An IGraph object
		// This object relies on the previous being loaded
		this.verilog_converter = new VerilogConverter(this.graph);
		this._initTable();
		this._initGraph();
	}

	_updateVerilog() {
		this.setState({ verilog_text: this.verilog_converter.Update(this.state.edge, this.state.reset, this.state.initial_state) });
	}

	_newState(xpos, ypos, name) {
		const state = this.graph.NewState(xpos, ypos, name);

		w2ui['grid'].columns.push({
			field: state.id, caption: name, size: '120px', sortable: true, resizable: true,
			editable: { type: 'text' }
		});

		const record_list = w2ui['grid'].records;
		let index;
		for (index in record_list) {
			const record = record_list[index];
			record[state.id] = "";
		}

		return state;
	}

	_deleteState(state) {
		if (this.graph.GetCellText(state) === this.state.initial_state) {
			this.setState({ initial_state: "" });
		}

		if (this.state.active_cell === state) {
			this.setState({ active_cell: null });
			document.getElementById("title-edit").value = "";
		}

		let index;
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
	}

	_editActiveCellString(character) {
		this.graph.EditActiveCellString(character, this.state.active_cell);
	}

	// inactivate the current active cell
	_clearActiveCell() {
		if (this.state.active_cell)
			this.graph.SetCellStroke(this.state.active_cell, this.INACTIVE_COLOR, this.INACTIVE_OUTPUT_COLOR);
		this.setState({ active_cell: null });
	}

	_newTransition(source, target, name) {
		return this.graph.NewTransition(source, target, name, this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
	}

	// Handle clicks (mainly select active element)
	_handleCellClick(cell_view) {
		$("#paper").focus();
		this._clearActiveCell();
		const cell = this.graph.HandleCellClick(cell_view, this.ACTIVE_COLOR);
		this.setState({active_cell: cell});
		document.getElementById("title-edit").value = this.graph.GetCellText(this.state.active_cell);
	}

	// Handle clicking on nothing
	_handleNothingClick(event) {
		$("#paper").focus();
		this._clearActiveCell();
		this._handleDragStart(event.originalEvent);
		document.getElementById("title-edit").value = "";
	}

	_initGraph() {
		const s1 = this._newState(100, 100, "FOO");
		const s2 = this._newState(100, 400, "BAR");
		const s3 = this._newState(400, 100, "FOO_2");
		const s4 = this._newState(400, 400, "BAR_2");

		this._newTransition(s1, s2, "(x == y) || (z < w)", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
		this._newTransition(s4, s3, "z[2] == x", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
		this._newTransition(s3, s1, "(z[2] == y) && (x != y)", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
		this._newTransition(s2, s4, "w & z & !x", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
		this._newTransition(s4, s1, "z | w | (z ^ x)", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
		this._updateVerilog();
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
		const state_list = this.graph.graph.getElements();
		const state_dict = {};
		let index;
		for (index in state_list) {
			const state = state_list[index];
			state_dict[state.id] = this.graph.GetCellText(state);
		}
		let column_index;
		for (column_index in w2ui['grid'].columns.slice(0, -2)) {
			column_index = Number(column_index) + 2;
			w2ui['grid'].columns[column_index].caption = state_dict[w2ui['grid'].columns[column_index].field];
		}
		w2ui['grid'].refresh();
	}

	// Handle changes in the source of the transition
	_handleResizeWindow() {
		//debugger 
		this.graph.HandleResizeWindow(Math.max(document.getElementById("paper").offsetWidth - 500, -500),
			Math.max(document.documentElement.clientHeight - 199, 0));
	}

	// Handle pressing a key
	_handleKeyDown(event) {
		switch (event.which) {
			case 46: // Delete key
				this._deleteState(this.state.active_cell);
				break;
			case 83: // Letter s 
				if (event.ctrlKey && event.shiftKey) {
					this._newState(0, 0, "NEW_STATE");
					event.preventDefault();
				}
				break;
			case 65: // Letter a 
				if (event.ctrlKey && event.shiftKey) {
					this._newTransition({ x: 0, y: 0 }, { x: 100, y: 100 }, 'x==1 && y==0', this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
					event.preventDefault();
				}
				break;
			case 8:
				this._editActiveCellString(null); break;
		}
		this._updateVerilog();
	}

	_handleKeyPress(event) {
		if ((event.keyCode || event.which) == 32)
			event.preventDefault();
		if (event.key.length == 1) {
			this._editActiveCellString(event.key);
			document.getElementById("title-edit").value = this.graph.GetCellText(this.state.active_cell);
			this._updateGrid();
		}
	}

	_handleDragStart(event) {
		this.setState({drag_mouse_x: event.clientX, drag_mouse_y: event.clientY, dragging: true});
	}

	_handleDrag(event) {
		if (this.state.dragging) {
			this.graph.MovePaper(event.clientX - this.state.drag_mouse_x, event.clientY - this.state.drag_mouse_y);
			this.setState({drag_mouse_x: event.clientX, drag_mouse_y: event.clientY});
		}
	}

	_handleMouseUp(event) {
		this.setState({dragging: false});
		this._updateVerilog();
	}

	_handleScroll(event) {
		const new_scale = Math.max(0.5, this.state.scale + 0.001 * event.nativeEvent.wheelDelta);
		this.graph.ScalePaper(new_scale, event.clientX, event.clientY);
		this.setState({scale: new_scale});
	}

	_handleEditTitleInput(event) {
		this.graph.ReplaceActiveCellString(document.getElementById("title-edit").value, this.state.active_cell);
	}

	_handleDoubleClick(event) {
		document.getElementById("title-edit").focus();
	}

	_handleToggleMenu(event) {
		this.setState({ show_settings: !this.state.show_settings });

	}

	_handleClockEdge(event) {
		this.setState({ edge: event.target.value });
		this._updateVerilog();
	}

	_handleReset(event) {
		this.setState({ reset: event.target.value });
		this._updateVerilog();
	}

	_handleInitialState(event) {
		this.setState({ initial_state: event.target.value });
		this._updateVerilog();
	}

	_handleFileNameChange(event) {
		this.setState({ file_name: event.target.value });
	}

	_getStateNames() {
		if (this.graph === null)
			return [];
		return this.graph.GetStateNames();
	}

	render() {
		return (
			<div className="root" onMouseUp={this._handleMouseUp} onMouseMove={this._handleDrag} style={this.state.dragging ? {cursor: "all-scroll"} : {}}>
			<SplitPane split="vertical" minSize={300}
					defaultSize={document.documentElement.clientWidth / 2}
					primary="second">
				<div className="window" id="next-state">
					<div className="next-state-menu">
						<h2>Next State Logic <span><input type="text" id="title-edit" disabled={this.state.active_cell === null} onChange={this._handleEditTitleInput} /></span></h2>
					</div>
						<pre>
							<div id="paper" className="paper" tabIndex="0" onKeyPress={this._handleKeyPress}
								onKeyDown={this._handleKeyDown} onWheel={this._handleScroll}>
								<ReactElementResize id="paper-resize" debounceTimeout={10} onResize={this._handleResizeWindow}></ReactElementResize>
							</div>
						</pre>
						<div id="grid"></div>
				</div>
				<div className="window">
					<h2>Verilog Code 
					<span id="dropdown-span"><ButtonToolbar>
					<Button ref="target" onClick={this._handleToggleMenu} id="dropdown-settings">
						<Glyphicon glyph="cog" style={this.state.initial_state === "" ? {color: "red"} : {}} />
						<Overlay
							animation={false}
							rootClose
							show={this.state.show_settings}
							onHide={() => this.setState({ show_settings: false })}
							placement="bottom"
							container={this}
							target={() => ReactDOM.findDOMNode(this.refs.target)}
						>
							<SettingsMenu handleEdge={this._handleClockEdge} clockEdge={this.state.edge}
								reset={this.state.reset} initialState={this.state.initial_state}
								handleReset={this._handleReset} handleInitialState={this._handleInitialState}
								stateNames={this._getStateNames()} handleFileNameChange={this._handleFileNameChange} 
								fileNameValue={this.state.file_name}
						/>
						</Overlay>
					</Button>
					<Button href={`data:text/plain;charset=utf-8,${encodeURIComponent(this.state.verilog_text)}`} download={this.state.file_name === "" ? "StateMachine.sv" : this.state.file_name}>
						<Glyphicon glyph="download-alt" />
					</Button>
					</ButtonToolbar></span>
					</h2>
					<div id="verilog"><pre>{this.state.verilog_text}</pre></div>
				</div>
			</SplitPane>
			</div>
		);
	}
};

export default BodyPane;