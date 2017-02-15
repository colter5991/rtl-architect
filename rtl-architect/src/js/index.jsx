/*****************************************************************************
 * Loads
 *****************************************************************************/

// MIT License
import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';

//import jQuery from "jquery";
//window.$ = window.jQuery = jQuery;

// BSD License
import React from 'react';
import ReactDOM from 'react-dom';

// My loads
import BodyPane from './BodyPane';
import 'main.css';

/*****************************************************************************
 * Global variables
 *****************************************************************************/
var graph;        // The joint.dia.Graph object
var paper;        // The joint.dia.Paper object
var activeCell;   // The active JointJs cell object
var StateData;

/*****************************************************************************
 * Global functions
 *****************************************************************************/
var initGraph;
var getCellText;

const Title = () => {
	return (
		<div className="title-text">
			<Jumbotron><h1>RTL Architect</h1></Jumbotron>
		</div>
    );
};

//(function () {
//	/*****************************************************************************
//	 * Constants
//	 *****************************************************************************/
//	var inactiveColor = "black"   // The outline color of inactive graph elements
//	var activeColor = "blue"      // outline color of the active element
//	var paperWidth = 800;
//	var paperHeight = 600;

//	/*****************************************************************************
//	 * Object definitions
//	 *****************************************************************************/

//	StateData = {
//		edge: "Positive",      // Whether the clock edge is positive, negative, or both
//		reset: "Active High",  // Whether the reset signal is active high or active low
//		init: "",              // The name of the initial state

//		// Get the transition text for a single state.  That is the case statement
//		// block with the big ol' if/else if structure to choose the nextState.
//		getStateTransitionText(state) {
//			var text = "\t\t" + getCellText(state) + ' : begin\n'
//			tList = graph.getConnectedLinks(state, { "outbound": true });

//			// Trim out transitions with no target
//			tList = tList.filter(function (x) { return x.getTargetElement() != null; });

//			// Generate text
//			for (tIndex in tList) {
//				t = tList[tIndex];
//				condition = getCellText(t);
//				target = getCellText(t.getTargetElement());
//				text += "\t\t\t"
//				if (tIndex != 0) { text += "else "; }
//				text += "if ( " + condition + " )\n"
//				text += "\t\t\t\tnextState = " + target + ";\n"
//			}
//			text += "\t\tend\n\n"
//			return text;
//		},

//		// Function to get how many bits it takes to represent all of the states
//		// For example, 5 states require 3 bits to represent.
//		getStateWidth: function () {
//			var length = graph.getElements().length;
//			if (length <= 2)
//				return 1;
//			else
//				return Math.ceil(Math.log2(length));
//		},

//		// Return a string representing the bit range, for example "[3:0]"
//		getBitRange: function () {
//			upperBit = this.getStateWidth() - 1;
//			if (upperBit == 0)
//				return ""
//			else
//				return "[" + upperBit + ":0]"
//		},

//		getEnumText: function () {
//			enumText = "typedef enum bit " + this.getBitRange() + " {\n"
//			stateList = graph.getElements()
//			for (stateIndex in stateList) {
//				state = stateList[stateIndex];
//				enumText += "\t" + getCellText(state) + ",\n"
//			}
//			enumText = enumText.substring(0, enumText.length - 2) + "\n} StateType;\n\n";
//			enumText += 'StateType state;\n';
//			enumText += 'StateType nextState;\n\n';
//			return enumText;
//		},

//		getTransitionText: function () {
//			text = "always_comb begin\n";
//			text += "\t nextState = state;\n";
//			text += "\t case(state)\n";

//			//for (stateName in this.stateDict){
//			//  text += this.stateDict[stateName].transitionText;
//			//}
//			stateList = graph.getElements()
//			for (stateIndex in stateList) {
//				state = stateList[stateIndex];
//				text += this.getStateTransitionText(state);
//			}

//			text += "\tendcase\n"
//			text += "end\n\n"
//			return text;
//		},

//		getFFText: function () {
//			// Determine the edge of the clock
//			if (this.edge == "Positive")
//				clockEdge = "posedge";
//			else if (this.edge == "Negative")
//				clockEdge = "negedge";
//			else
//				clockEdge = "";

//			// Determine the edge of the reset
//			if (this.reset == "Active High") {
//				resetEdge = "posedge";
//				resetCondition = "rst == 1";
//			}
//			else {
//				resetCondition = "rst == 0";
//				resetEdge = "negedge";
//			}

//			text = "always_ff @(" + clockEdge + " clk, " + resetEdge + " rst) begin\n"
//			text += "\tif (" + resetCondition + ");\n";
//			text += "\t\tstate <= " + this.init + ";\n";
//			text += "\telse\n"
//			text += "\t\tstate <= nextState\n";
//			text += "end\n\n";
//			return text;
//		},

//		getOutputText: function () {
//			var record;
//			stateDict = {};
//			defaultState = {};
//			for (index in w2ui['grid'].records) {
//				record = w2ui['grid'].records[index];
//				defaultState[record.variable] = record['default'];
//				for (stateID in record) {
//					if (stateID != 'variable' && stateID != 'default' && stateID != 'changes') {
//						if (!stateDict[stateID])
//							stateDict[stateID] = {}
//						stateDict[stateID][record.variable] = record[stateID];
//					}
//				}
//			}
//			var text = "always_comb begin\n";
//			for (var variable in defaultState) {
//				text += "\t" + variable + " = " + defaultState[variable] + ";\n";
//			}
//			text += "\n\tcase(state)\n";
//			for (var stateID in stateDict) {
//				if (stateID == 'recid')
//					continue;
//				stateName = getCellText(graph.getCell(stateID));
//				text += "\t\t" + stateName + ": begin\n"
//				for (var variable in stateDict[stateID]) {
//					var expression = stateDict[stateID][variable];
//					if (expression != "") {
//						text += "\t\t\t" + variable + " = " + expression + ";\n"
//					}
//				}
//				text += "\t\tend\n\n";
//			}
//			text += "\tendcase\n"
//			text += "end\n\n"
//			return text;
//		},

//		getVerilogHTML: function () {
//			// Build up the text part by part
//			html = this.getEnumText();
//			html += this.getTransitionText();
//			html += this.getFFText();
//			html += this.getOutputText();

//			// Convert to a nice html format
//			html = html.replace(new RegExp('\n', 'g'), '<br>');
//			html = html.replace(new RegExp('\t', 'g'), '&nbsp&nbsp&nbsp&nbsp');
//			return html;
//		},

//		update: function () {
//			html = this.getVerilogHTML();
//			document.getElementById("verilog").innerHTML = html;
//		},
//	}

//	/*****************************************************************************
//	 * Function definitions
//	 *****************************************************************************/

//	function isState(model) {
//		return model.attributes.type == "fsa.State";
//	}

//	// Append the given character to the end of the active cell string
//	function editActiveCellString(character) {
//		if (activeCell == null) {
//			return
//		}
//		var text = getCellText(activeCell);
//		if (character)
//			text += character
//		else if (text != "")
//			text = text.substring(0, text.length - 1);
//		setCellText(activeCell, text);
//	}

//	// Create a new State View
//	function newState(xpos, ypos, name) {
//		var state = new joint.shapes.fsa.State({
//			position: { x: xpos, y: ypos },
//			size: { width: 120, height: 40 },
//			attrs: { text: { text: name } }
//		});

//		graph.addCell(state);
//		StateData.update();
//		w2ui['grid'].columns.push({
//			field: state.id, caption: name, size: '120px', sortable: true, resizable: true,
//			editable: { type: 'text' }
//		});

//		recordList = w2ui['grid'].records;
//		for (index in recordList) {
//			record = recordList[index];
//			record[state.id] = "";
//		}

//		return state;
//	}

//	// delete a given state
//	function deleteState(state) {
//		for (index in w2ui['grid'].columns) {
//			if (w2ui['grid'].columns[index].field == state.id) {
//				w2ui['grid'].columns.splice(index, 1);
//				break;
//			}
//		}
//		for (index in w2ui['grid'].records) {
//			delete w2ui['grid'].records[index][state.id];
//		}
//		state.remove();
//		StateData.update();
//	};

//	// Set the stroke of the given cell to the given color
//	function setCellStroke(state, stroke) {
//		if (state.attributes.type == "fsa.State") {
//			state.attr("circle/stroke", stroke);
//		}
//		else {
//			activeCell.attr({ '.connection': { stroke: stroke } })
//		}
//	}

//	// Set the text of the given cell to the given text
//	function setCellText(state, text) {
//		if (state.attributes.type == "fsa.State")
//			activeCell.attr("text/text", text)
//		else
//			state.label(0, { attrs: { text: { text: text } } })

//		StateData.update();
//	}

//	// Get the text of the given cell
//	getCellText = function (state) {
//		if (!state)
//			return null;
//		if (state.attributes.type == "fsa.State")
//			return state.attr("text/text");
//		else
//			return state.label(0).attrs.text.text;
//	}

//	// inactivate the current active cell
//	function clearActiveCell() {
//		if (activeCell)
//			setCellStroke(activeCell, inactiveColor);
//		activeCell = null;
//	}

//	// Make a new link
//	function newTransition(source, target, name) {

//		var cell = new joint.shapes.fsa.Arrow({
//			source: source,
//			target: target,
//			labels: [{ position: 0.5, attrs: { text: { text: name || '' } } }],
//		});

//		cell.on("change:source", function () { StateData.update(); });
//		cell.on("change:target", function () { StateData.update(); });

//		graph.addCell(cell);
//		return cell;
//	}

//	/*****************************************************************************
//	 * Initialization code
//	 *****************************************************************************/
//	initGraph = function () {
//		graph = new joint.dia.Graph();
//		paper = new joint.dia.Paper({
//			el: $('#paper'),
//			width: paperWidth,
//			height: paperHeight,
//			gridSize: 1,
//			model: graph
//		});

//		s1 = newState(100, 100, "FOO");
//		s2 = newState(100, 400, "BAR");
//		s3 = newState(400, 100, "FOO_2");
//		s4 = newState(400, 400, "BAR_2");

//		newTransition(s1, s2, "(x == y) || (z < w)");
//		newTransition(s4, s3, "z[2] == x");
//		newTransition(s3, s1, "(z[2] == y) && (x != y)");
//		newTransition(s2, s4, "w & z & !x");
//		newTransition(s4, s1, "z | w | (z ^ x)");
//		StateData.update();


//		/*****************************************************************************
//		 * Event handlers
//		 *****************************************************************************/

//		// Handle clicks (mainly select active element)
//		paper.on('cell:pointerdown', function (cellView, evt, x, y) {
//			$("#paper").focus();
//			clearActiveCell();
//			activeCell = cellView.model;
//			setCellStroke(activeCell, activeColor);
//		});

//		// Handle clicking on nothing
//		paper.on('blank:pointerdown', function (cellView, evt, x, y) {
//			$("#paper").focus();
//			clearActiveCell();
//		});

//		$("#paper").on("keydown", function (event) {
//			switch (event.which) {
//				case 46:
//					deleteState(activeCell); break;
//				case 83: // Letter s 
//					if (event.ctrlKey && event.shiftKey) {
//						newState(paperWidth / 2, paperHeight / 2, "NEW_STATE");
//						event.preventDefault();
//					}
//					break;
//				case 65: // Letter a 
//					if (event.ctrlKey && event.shiftKey) {
//						newTransition({ x: paperWidth / 4, y: paperHeight / 4 }, { x: paperWidth * 3 / 4, y: paperHeight * 3 / 4 }, 'x==1 && y==0');
//						event.preventDefault();
//					}
//					break;
//				case 8:
//					editActiveCellString(null); break;
//			}
//		});

//		$("#paper").on("keypress", function (event) {
//			console.log(event.originalEvent)
//			if ((event.keyCode || event.which) == 32)
//				event.preventDefault();
//			str = String.fromCharCode(event.keyCode || event.which)
//			if (event.key.length == 1)
//				editActiveCellString(event.key);
//		})
//	};
//})();

//// TO BE REPLACED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1

///*****************************************************************************
// * Global variables
// *****************************************************************************/

//var tabArr = [
//  { name: "tab1", onSwitch: function () { } },
//  { name: "tab2", onSwitch: updateRegForm },
//  { name: "tab3", onSwitch: updateGrid }
//];

///*****************************************************************************
// * Functions
// *****************************************************************************/

//function initGrid() {
//	var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
//	$('#layout').w2layout({
//		name: 'layout',
//		panels: [
//			{ type: 'top', size: 45, resizable: false, style: pstyle + ' text-align: center', content: topContent },
//			{
//				type: 'main', style: pstyle, content: mainContent,
//				tabs: {
//					name: 'tabs',
//					active: 'tab1',
//					tabs: [
//					  { id: 'tab1', caption: 'Next State Logic' },
//					  { id: 'tab2', caption: 'State Register' },
//					  { id: 'tab3', caption: 'Output Logic' },
//					],
//					onClick: function (event) {
//						switchToTab(event.target, tabArr);
//					}
//				}
//			},
//			{ type: 'right', size: 400, resizable: true, style: pstyle, content: rightContent },
//		]
//	});
//}

//function switchToTab(currentTab, tabArr) {
//	for (var tabIndex in tabArr) {
//		var tab = tabArr[tabIndex].name;
//		tabObject = $('#' + tab + "-content");
//		if (tab == currentTab) {
//			tabObject.css("display", "block");
//			tabArr[tabIndex].onSwitch();
//		}
//		else {
//			tabObject.css("display", "none");
//			//updateRegForm();
//			//w2ui['regForm'].refresh();
//			//w2ui['grid'].refresh();
//		}
//	}
//	if (currentTab == "tab1") {
//		$("#paper").focus();
//	}
//}

//function initRegSettings() {
//	$('#regForm').w2form({
//		name: 'regForm',
//		header: 'Register Settings',
//		fields: [
//		  {
//		  	name: 'edge',
//		  	type: 'list',
//		  	options: {
//		  		items: ['Positive', 'Negative', 'Both'],
//		  	},
//		  },

//		  {
//		  	name: 'reset',
//		  	type: 'list',
//		  	options: {
//		  		items: ['Active High', 'Active Low'],
//		  	},
//		  },
//		  {
//		  	name: 'init',
//		  	type: 'list',
//		  	options: {
//		  		items: [],
//		  	},
//		  },
//		]
//	});


//	w2ui['regForm'].on('change', function (event) {
//		event.onComplete = function (event) {
//			if (w2ui['regForm'].record.edge)
//				StateData.edge = w2ui['regForm'].record.edge.text;
//			if (w2ui['regForm'].record.reset)
//				StateData.reset = w2ui['regForm'].record.reset.text;
//			if (w2ui['regForm'].record.init)
//				StateData.init = w2ui['regForm'].record.init.text;
//			StateData.update();
//		}
//	});
//}

//function updateRegForm() {
//	itemList = []
//	nameList = graph.getElements().map(getCellText);
//	for (index in nameList) {
//		state = nameList[index];
//		itemList.push({ id: state, name: state, text: state })
//	}
//	w2ui['regForm'].fields[2].options.items = itemList
//	w2ui['regForm'].refresh()
//}

//function initTable() {
//	$('#grid').w2grid({
//		name: 'grid',
//		show: {
//			toolbar: true,
//			footer: false,
//			toolbarSave: false,
//		},
//		columns: [
//			{
//				field: 'variable', caption: 'Variable Name', size: '120px', sortable: true, resizable: true,
//				editable: { type: 'text' }
//			},
//			{
//				field: 'default', caption: 'Default Value', size: '120px', sortable: true, resizable: true,
//				editable: { type: 'text' }
//			},
//		],
//		toolbar: {
//			items: [
//				{ id: 'add', type: 'button', caption: 'Add Record', icon: 'w2ui-icon-plus' }
//			],
//			onClick: function (event) {
//				if (event.target == 'add') {
//					w2ui.grid.add({ recid: w2ui.grid.records.length + 1, variable: "VAR" + (w2ui.grid.records.length + 1), 'default': 0 });
//				}
//			}
//		},
//		records: [
//			{ recid: 1, variable: 'Y', default: 0 },
//		],

//		onChange: function (event) {
//			event.onComplete = function (event) {
//				this.save();
//				StateData.update();
//			}
//		}
//	});

//	// Re-implement save and merge function because the built in implementation
//	// doesn't like field names with dashes in them
//	w2ui['grid'].save = function () {
//		changes = this.getChanges();
//		for (cIndex in this.getChanges()) {
//			change = changes[cIndex];
//			record = this.get(change.recid);
//			for (item in change) {
//				if (item != 'recid')
//					record[item] = change[item];
//			}
//			delete record.changes;
//		}
//	}
//	w2ui['grid'].refresh()
//}


//// This should be called whenever the grid tab is opened.  It updates the state names.
//function updateGrid() {
//	stateList = graph.getElements()
//	var stateDict = {};
//	for (index in stateList) {
//		state = stateList[index];
//		stateDict[state.id] = getCellText(state);
//	}
//	for (columnIndex in w2ui['grid'].columns.slice(0, -2)) {
//		columnIndex = Number(columnIndex) + 2;
//		w2ui['grid'].columns[columnIndex].caption = stateDict[w2ui['grid'].columns[columnIndex].field];
//	}
//	w2ui['grid'].refresh();

//}

///*****************************************************************************
// * Initialize everything
// *****************************************************************************/

//$(function () {
//	//initGrid();
//	//initRegSettings();
//	//initTable();
//	//initGraph();
//	//switchToTab("tab1", tabArr);
//});

ReactDOM.render(<Title />, document.getElementById("title-text"));
ReactDOM.render(<BodyPane />, document.getElementById("application"));