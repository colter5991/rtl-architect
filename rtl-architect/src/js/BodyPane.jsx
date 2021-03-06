// ReSharper disable UnknownCssClass
// ReSharper disable Html.TagShouldBeSelfClosed

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
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import MenuItem from "react-bootstrap/lib/MenuItem";
import Overlay from "react-bootstrap/lib/Overlay";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import SettingsMenu from "./SettingsMenu"
import {ReactElementResize} from "react-element-resize";
import FileDownload from "./file-download";
import Update from "immutability-helper";

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
		this.INACTIVE_DEFAULT_OUTPUT_COLOR = "black";
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
		this._handleUnload = this._handleUnload.bind(this);
		this._handleFileLoad = this._handleFileLoad.bind(this);
		this._handleSaveGraph = this._handleSaveGraph.bind(this);
		
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

		window.addEventListener("beforeunload", this._handleUnload);
	}

	componentWillUnmount() {
		window.removeEventListener("beforeunload", this._handleUnload);
	}

	_updateVerilog() {
		this.setState({ verilog_text: this.verilog_converter.Update(this.state.edge, this.state.reset, this.state.initial_state) });
	}

	_handleUnload(event) {
		event.returnValue = "Are you sure you want to leave?";
	}

	_newState(xpos, ypos, name) {
		return this.graph.NewState(xpos, ypos, name, this.INACTIVE_OUTPUT_COLOR);
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
			this.graph.SetCellStroke(this.state.active_cell, this.INACTIVE_COLOR, this.INACTIVE_OUTPUT_COLOR, this.INACTIVE_DEFAULT_OUTPUT_COLOR);
		}
	}

	_newTransition(source, target, name) {
		return this.graph.NewTransition(source, target, name, this._handleTransitionChangeSource, this._handleTransitionChangeTarget, this.INACTIVE_OUTPUT_COLOR);
	}

	_newOutput(xpos, ypos, name) {
		return this.graph.NewState(xpos, ypos, name, this.INACTIVE_OUTPUT_COLOR, true);
	}

	_newOutputTransition(source, target, condition) {
		this.graph.NewTransition(source, target, condition, this._handleTransitionChangeSource, this._handleTransitionChangeTarget, this.INACTIVE_OUTPUT_COLOR, true);
	}

	_newDefaultOutput(xpos, ypos, name) {
		this.graph.NewState(xpos, ypos, name, this.INACTIVE_DEFAULT_OUTPUT_COLOR, true, true);
	}

	// Handle clicks (mainly select active element)
	_handleCellClick(cell_view) {
		const dt = new Date();
		if (dt.getTime() - this.state.debounce_timer < 200) {
			this._handleDoubleClick(cell_view);
			return;
		}

		document.getElementById("paper").focus();
		this._clearActiveCell();
		const cell = this.graph.HandleCellClick(cell_view, this.ACTIVE_COLOR);
		this.setState({active_cell: cell, editting_textarea: false, debounce_timer: dt.getTime()});
	}

	// Handle clicking on nothing
	_handleNothingClick(event) {
		document.getElementById("paper").focus();
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

		const output = this._newOutput(250, 20, "E = 1\nF = 0");
		this._newOutputTransition(s1, output, "x == 1");
		this._newDefaultOutput(10, 10, "E = 0\nF = 1");

		this._updateVerilog();
	}

	// Handle changes in the source of the transition
	_handleResizeWindow() {
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
					this._newState(30, 30, "NEW_STATE");
					event.preventDefault();
				}
				break;
			case 65: // Letter a 
				if (event.ctrlKey && event.shiftKey) {
					this._newTransition({ x: 0, y: 0 }, { x: 100, y: 100 }, "x == 1 && y == 0", this._handleTransitionChangeSource, this._handleTransitionChangeTarget);
					event.preventDefault();
				}
				break;
			case 68: // Letter d
				if (event.ctrlKey && event.shiftKey) {
					this._newOutputTransition({ x: 0, y: 0 }, { x: 100, y: 100 }, "y == 0");
					event.preventDefault();
				}
				break;
			case 70: // Letter f
				if (event.ctrlKey && event.shiftKey) {
					this._newOutput(30, 30, "G = 1");
					event.preventDefault();
				}
				break;
			case 71: // Letter g
				if (event.ctrlKey && event.shiftKey) {
					this._newDefaultOutput(30, 30, "H = 0\nJ = 1");
					event.preventDefault();
				}
				break;
			case 8:
				this._editActiveCellString(null); break;
		}
		this._updateVerilog();
	}

	_handleKeyPress(event) {
		if ((event.keyCode || event.which) === 32)
			event.preventDefault();
		if (event.key.length === 1) {
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

	_handleMouseUp() {
		this._updateVerilog();
		this.setState({dragging: false});
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

	_handleToggleMenu() {
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

	// CREDIT: Andy E - http://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
	_handleFileLoad(event) {
		const target = event.target;
		const files = target.files;

		// FileReader support
		if (FileReader && files && files.length) {
			const fr = new FileReader();
			fr.onload = function() {
				// Continue loading here
				const new_data = JSON.parse(decodeURIComponent(fr.result.substring(30)));
				const new_state = this.graph.LoadData(new_data);
				this.setState(new_state);
				this._updateVerilog();
			}.bind(this);
			fr.readAsText(files[0]);
		}
		// Not supported
		else {
			window.alert("Your browser does not support file loads.");
		}
	}

	_handleSaveGraph() {
		this._clearActiveCell();
		const saved_state = Update(this.state, {
			active_cell: {$set: null},
			dragging: {$set: false},
			scale: {$set: 1},
			show_settings: {$set: false},
			editting_textarea: {$set: false},
			debounce_timer: {$set: 0},
			verilog_text: {$set: ""}
		});
		delete saved_state["scale"];
		FileDownload(`data:text/plain;charset=utf-8,${encodeURIComponent(this.graph.GetData(saved_state))}`, "StateMachine.json");
	}

	_getStateNames() {
		if (this.graph === null)
			return [];
		return this.graph.GetStateNames();
	}

	render() {
		return (
			<div className="root" onMouseUp={this._handleMouseUp} onMouseMove={this._handleDrag} style={this.state.dragging ? {cursor: "move"} : {}}>
			<SplitPane split="vertical" minSize={300}
					defaultSize={document.documentElement.clientWidth / 2}
					primary="second">
				<div className="window" id="next-state">
					<Row className="next-state-menu">
						<Col md={5} className="next-state-title">
							<h2>Next State Logic</h2> 
						</Col>
						<Col md={4} className="next-state-buttons">
							<ButtonToolbar className="graph-toolbar">
								<DropdownButton title={<Glyphicon glyph="plus" />} noCaret id="add-button">
									<MenuItem onClick={() => this._newState(30, 30, "NEW_STATE")} eventKey="1">New State</MenuItem>
									<MenuItem onClick={() => this._newTransition({ x: 0, y: 0 }, { x: 100, y: 100 }, "x == 1 && y == 0", this._handleTransitionChangeSource, this._handleTransitionChangeTarget)} eventKey="2">New Transition</MenuItem>
									<MenuItem onClick={() => this._newOutput(30, 30, "G = 1")} eventKey="3">New Output</MenuItem>
									<MenuItem onClick={() => this._newOutputTransition({ x: 0, y: 0 }, { x: 100, y: 100 }, "y == 0")} eventKey="3">New Output Condition</MenuItem>
									<MenuItem onClick={() => this._newDefaultOutput(30, 30, "H = 0\nJ = 1")} eventKey="4">New Default Output</MenuItem>
								</DropdownButton>
								<Button disabled={this.state.active_cell === null} onClick={() => this._deleteState(this.state.active_cell)}>
									<Glyphicon glyph="remove" style={this.state.active_cell !== null ? {color: "crimson"} : {}} />
								</Button>
								<Button id="save-graph" onClick={this._handleSaveGraph}>
									<Glyphicon glyph="floppy-save" />
								</Button>
								<Button onClick={() => document.getElementById("file-open").click()}>
									<Glyphicon glyph="folder-open" />
									<input id="file-open" onChange={this._handleFileLoad} type="file" accept=".json" style={{ display: "none" }} />
								</Button>
							</ButtonToolbar>
						</Col>
						<Col md={3} className="logic-checkboxes">
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
				<div className="window verilog-code">
					<h2>Verilog Code 
					<ButtonToolbar className="options-toolbar">
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
					</ButtonToolbar>
					</h2>
					<div id="verilog"><pre>{this.state.verilog_text}</pre></div>
				</div>
			</SplitPane>
			</div>
		);
	}
};

export default BodyPane;