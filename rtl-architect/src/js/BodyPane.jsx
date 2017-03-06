// BSD License
import React from "react";
import ReactDom from "react-dom";

// MIT License
import SplitPane from "react-split-pane";
import "SplitPane.css";
import Button from "react-bootstrap/lib/Button";
import Checkbox from "react-bootstrap/lib/Checkbox";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import ButtonToolbar from "react-bootstrap/lib/ButtonToolbar";
import Overlay from "react-bootstrap/lib/Overlay";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import SettingsMenu from "./SettingsMenu"
import {ReactElementResize} from "react-element-resize";
import Textarea from "react-textarea-autosize";
//import jQuery from "jquery";
//window.$ = window.jQuery = jQuery;

// My Loads
import "BodyPane.css";
import VerilogConverter from "./VerilogConverter";
import JointGraph from "./JointGraph";
import Utils from "./Utils";

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
		this._handleTransitionChangeSource = this._handleTransitionChangeSource.bind(this);
		this._handleChangeNextStateLogic = this._handleChangeNextStateLogic.bind(this);
		this._handleChangeOutputLogic = this._handleChangeOutputLogic.bind(this);
		
		window.onresize = this._handleResizeWindow;

		this.graph = null;
		this.verilog_converter = null;
		this.state = {
			edge: "Positive", // Whether the clock edge is positive, negative, or both
			reset: "Active High", // Whether the reset signal is active high or active low
			initial_state: "FOO", // The name of the initial state
			verilog_text: "", // The Verilog code that is shown in the verilog panel
			active_cell: null, // The currently active cell object
			drag_mouse_x: 0,
			drag_mouse_y: 0,
			dragging: false,
			scale: 1,
			show_settings: false,
			file_name: "",
			next_state_logic: true,
			output_logic: true,
			editting_textarea: false,
			debounce_timer: 0
	};
	}

	componentDidMount() {
		// This must be performed after the object has mounted
		this.graph = new JointGraph(document.getElementById("paper").offsetWidth, document.documentElement.clientHeight - 199,
			this._handleCellClick, this._handleNothingClick, this._updateVerilog); // An IGraph object
		// This object relies on the previous being loaded
		this.verilog_converter = new VerilogConverter(this.graph);
		this._initGraph();
	}

	_updateVerilog() {
		this.setState({ verilog_text: this.verilog_converter.Update(this.state.edge, this.state.reset, this.state.initial_state) });
	}

	_newState(xpos, ypos, name) {
		const state = this.graph.NewState(xpos, ypos, name, this.INACTIVE_OUTPUT_COLOR);
		return state;
	}

	_deleteState(state) {
		if (state === null)
			return;

		if (this.graph.GetCellText(state) === this.state.initial_state) {
			this.setState({ initial_state: "" });
		}

		if (this.state.active_cell === state) {
			this.setState({ active_cell: null });
			document.getElementById("title-edit").value = "";
		}

		this.graph.DeleteState(state);
	}

	_editActiveCellString(character) {
		this.graph.EditActiveCellString(character, this.state.active_cell);
	}

	// inactivate the current active cell
	_clearActiveCell() {
		if (this.state.active_cell) {
			this.graph.SetCellStroke(this.state.active_cell, this.INACTIVE_COLOR, this.INACTIVE_OUTPUT_COLOR);
		}
	}

	_newTransition(source, target, name) {
		return this.graph.NewTransition(source, target, name, this._handleTransitionChangeSource, this._handleTransitionChangeTarget, this.INACTIVE_OUTPUT_COLOR);
	}

	_newOutput(source, target, condition, output) {
		const state = this.graph.NewState(target.x, target.y, output, this.INACTIVE_OUTPUT_COLOR, true);
		this.graph.NewTransition(source, state, condition, this._handleTransitionChangeSource, this._handleTransitionChangeTarget, this.INACTIVE_OUTPUT_COLOR, true);
	}

	// Handle clicks (mainly select active element)
	_handleCellClick(cell_view) {
		const dt = new Date();
		if (dt.getTime() - this.state.debounce_timer < 200) {
			this._handleDoubleClick(cell_view);
			return;
		}

		$("#paper").focus();
		this._clearActiveCell();
		const cell = this.graph.HandleCellClick(cell_view, this.ACTIVE_COLOR);
		this.setState({active_cell: cell, editting_textarea: false, debounce_timer: dt.getTime()});
	}

	// Handle clicking on nothing
	_handleNothingClick(event) {
		$("#paper").focus();
		this._clearActiveCell();
		this._handleDragStart(event.originalEvent);
		document.getElementById("title-edit").value = "";
		this.setState({editting_textarea: false, active_cell: null});
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

		this._newOutput(s1, { x: 250, y: 20 }, "x == 1", "E = 1\nF = 0");

		this._updateVerilog();
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
					this._newTransition({ x: 0, y: 0 }, { x: 100, y: 100 }, "x == 1 && y == 0", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
					event.preventDefault();
				}
				break;
			case 79: // Letter o
				if (event.ctrlKey && event.shiftKey) {
					this._newOutput({ x: 0, y: 0 }, { x: 100, y: 100 }, "y == 0", "G = 1");
					event.preventDefault();
				}
				break;			case 8:
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
		this.graph.ScalePaper(new_scale);
		this.setState({scale: new_scale});
	}

	_handleEditTitleInput(event) {
		document.getElementById("title-edit").value = this.graph.LegalizeText(this.state.active_cell, event.target.value);
		this.graph.ReplaceActiveCellString(document.getElementById("title-edit").value, this.state.active_cell);
	}

	_handleDoubleClick(cell_view) {
		document.getElementById("title-edit").value = this.graph.GetCellText(this.graph.GetCell(cell_view));
		document.getElementById("title-edit").focus();
		this.setState({editting_textarea: true});
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

	_handleTransitionChangeSource() { }

	_handleTransitionChangeTarget() { }

	_handleChangeNextStateLogic(event) {
		if (event.target.checked) {
			this.graph.ShowHideNextStateLogic(true);
		} else {
			this.graph.ShowHideNextStateLogic(false);
		}

		this.setState({ next_state_logic: event.target.checked });
	}

	_handleChangeOutputLogic(event) {
		if (event.target.checked) {
			this.graph.ShowHideOutputLogic(true);
		} else {
			this.graph.ShowHideOutputLogic(false);
		}

		this.setState({ output_logic: event.target.checked });
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
					<Row className="next-state-menu">
						<Col className="logic-checkboxes" sm={5}>
							<h2>Next State Logic</h2> 
						</Col>
						<Col sm={3}></Col>
						<Col className="logic-checkboxes" sm={4}>
							<Row><Checkbox inline checked={this.state.next_state_logic} onChange={this._handleChangeNextStateLogic}>Show Next State Logic</Checkbox></Row>
							<Row><Checkbox inline checked={this.state.output_logic} onChange={this._handleChangeOutputLogic}>Show Output Logic</Checkbox></Row>
						</Col>
					</Row>
					<textarea id="title-edit" style={this.state.active_cell !== null && this.state.editting_textarea ?
							{
								width: (Utils.GetLongestLine(this.graph.GetCellText(this.state.active_cell)) * 10) + 20 + "px",
								height: Utils.CountLines(this.graph.GetCellText(this.state.active_cell)) * 20 + 10,
								left: this.graph.GetCellPosition(this.state.active_cell, this.state.scale).x
									- ((Utils.GetLongestLine(this.graph.GetCellText(this.state.active_cell)) * 10) + 20)*0.5 - 10 + "px",
								top: this.graph.GetCellPosition(this.state.active_cell, this.state.scale).y
									- (Utils.CountLines(this.graph.GetCellText(this.state.active_cell)) * 20 + 10)*0.5 - 100 + "px",
								zIndex: 1
							} :
							{ width: "50px", height: "20px", left: "-10000px", top: "-10000px", zIndex: -1 }
						}
						wrap="off" onChange={this._handleEditTitleInput}></textarea>
					<pre>
						<div id="paper" className="paper" tabIndex="0" onKeyPress={this._handleKeyPress}
							onKeyDown={this._handleKeyDown} onWheel={this._handleScroll}>
							<ReactElementResize id="paper-resize" debounceTimeout={10} onResize={this._handleResizeWindow}></ReactElementResize>
						</div>
					</pre>
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
							target={() => ReactDom.findDOMNode(this.refs.target)}
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