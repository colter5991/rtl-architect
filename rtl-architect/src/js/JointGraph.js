// MIT License
//import jQuery from "jquery";
//window.$ = window.jQuery = jQuery;

// MPL 2.0 License
import Joint from "jointjs";
import "jointjs/css/layout.css";
import "jointjs/css/themes/default.css";

// My Loads
import IGraph from "./IGraph";
import "./OutputTransition";
import "./Output";

class JointGraph extends IGraph {
	// Takes in a jointjs graph object
	constructor(paper_width, paper_height, cell_click_handler, nothing_click_handler, double_click_handler, update_handler) {
		super();
		this.graph = new Joint.dia.Graph();
		this.paper = new Joint.dia.Paper({
			el: $('#paper'),
			width: paper_width,
			height: paper_height,
			gridSize: 1,
			model: this.graph
		});

		this.paper.on('cell:pointerdblclick', double_click_handler);
		this.paper.on('cell:pointerdown', cell_click_handler);
		this.paper.on('blank:pointerdown', nothing_click_handler);
		this.graph.on('change', function() {
			update_handler();
		});
	}

	/*****************************************************************************
	* Overrides
	*****************************************************************************/

	GetCellText(state) {
		if (!state)
			return null;
		if (state.attributes.type == "fsa.State")
			return state.attr("text/text");
		else
			return state.label(0).attrs.text.text;
	}

	GetConnectedLinks(element, opt) {
		return this.graph.getConnectedLinks(element, opt);
	}

	GetElements() {
		return this.graph.getElements();
	}

	GetCell(state_id) {
		return this.graph.getCell(state_id);
	}


	/*****************************************************************************
	* Utility Functions
	*****************************************************************************/

	// Append the given character to the end of the active cell string
	EditActiveCellString(character, active_cell) {
		if (active_cell == null) {
			return;
		}
		let text = this.GetCellText(active_cell);
		if (character)
			text += character;
		else if (text != "")
			text = text.substring(0, text.length - 1);
		this._setCellText(active_cell, text);
	}

	// Replaces the active cell string with the string
	ReplaceActiveCellString(string, active_cell) {
		if (active_cell === null) {
			return;
		}
		this._setCellText(active_cell, string);
	}

	// Create a new State View
	NewState(xpos, ypos, name, output=false) {
		if (output) {
			var state = new Joint.shapes.output.Element({
				position: { x: xpos, y: ypos },
				size: { width: 100, height: 40 },
				attrs: { text: { text: name } }
			});
		} else {
			var state = new Joint.shapes.fsa.State({
				position: { x: xpos, y: ypos },
				size: { width: 120, height: 40 },
				attrs: { text: { text: name } }
			});
		}

		this.graph.addCell(state);

		return state;
	}

	// delete a given state
	DeleteState(state) {
		state.remove();
	}

	// Set the stroke of the given cell to the given color
	SetCellStroke(state, stroke, output_color) {
		if (state.attributes.type == "fsa.State") {
			state.attr("circle/stroke", stroke);
		} else if (state.attributes.type === "fsa.OutputTransition") {
			state.attr({ '.connection': { stroke: output_color } });
		} else {
			state.attr({ '.connection': { stroke: stroke } });
		}
	}

	// Set the text of the given cell to the given text
	_setCellText(state, text) {
		if (state.attributes.type == "fsa.State")
			state.attr("text/text", text);
		else
			state.label(0, { attrs: { text: { text: text } } });
	}

	// Make a new link
	NewTransition(source, target, name, handle_cell_change_source, handle_cell_change_target, output=false) {
		let  cell;
		if (output) {
			cell = new Joint.shapes.outputTransition.Element({
				source: source,
				target: target,
				labels: [{ position: 0.5, attrs: { text: { text: name || '' } } }]
			});
			cell.attr({ '.connection': { stroke: "green" } });
		} else {
			cell = new Joint.shapes.fsa.Arrow({
				source: source,
				target: target,
				labels: [{ position: 0.5, attrs: { text: { text: name || '' } } }]
			});
		}
		cell.on("change:source", handle_cell_change_source);
		cell.on("change:target", handle_cell_change_target);

		this.graph.addCell(cell);
		return cell;
	}

	HandleCellClick(cell_view, active_color) {
		this.SetCellStroke(cell_view.model, active_color);
		return cell_view.model;
	}

	HandleResizeWindow(width, height) {
		this.paper.setDimensions(width, height);
	}

	MovePaper(x, y) {
		this.paper.setOrigin(this.paper.options.origin.x + x, this.paper.options.origin.y + y);
	}

	ScalePaper(scale, mousex, mousey) {
		this.paper.scale(scale, scale);
	}

	GetStateNames() {
		const state_names = [];
		const elements = this.graph.getElements();
		for (let state = 0; state < elements.length; state++) {
			state_names.push({id: state, name: this.GetCellText(elements[state]) });
		}

		return state_names;
	}
}

export default JointGraph;