// MPL 2.0 License
import Joint from "jointjs";

// My Loads
import IGraph from "./IGraph";

class JointGraph extends IGraph {
	// Takes in a jointjs graph object
	constructor() {
		this.graph = new Joint.dia.Graph();
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
		return this.graph.GetCell(state_id);
	}


	/*****************************************************************************
	* Utility Functions
	*****************************************************************************/

	// Append the given character to the end of the active cell string
	EditActiveCellString(character, active_cell) {
		if (active_cell == null) {
			return;
		}
		var text = this.GetCellText(active_cell);
		if (character)
			text += character;
		else if (text != "")
			text = text.substring(0, text.length - 1);
		this._setCellText(active_cell, text);
	}

	// Create a new State View
	NewState(xpos, ypos, name) {
		var state = new Joint.shapes.fsa.State({
			position: { x: xpos, y: ypos },
			size: { width: 120, height: 40 },
			attrs: { text: { text: name } }
		});

		this.graph.addCell(state);

		return state;
	}

	// delete a given state
	DeleteState(state) {
		state.remove();
	}

	// Set the stroke of the given cell to the given color
	SetCellStroke(state, stroke, active_cell) {
		if (state.attributes.type == "fsa.State") {
			state.attr("circle/stroke", stroke);
		}
		else {
			active_cell.attr({ '.connection': { stroke: stroke } });
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
	NewTransition(source, target, name, callback) {

		var cell = new Joint.shapes.fsa.Arrow({
			source: source,
			target: target,
			labels: [{ position: 0.5, attrs: { text: { text: name || '' } } }],
		});

		cell.on("change:source", function () { callback(); });
		cell.on("change:target", function () { callback(); });

		this.graph.addCell(cell);
		return cell;
	}
}

export default JointGraph;