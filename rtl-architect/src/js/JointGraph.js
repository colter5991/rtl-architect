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
import Utils from "./Utils";

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
			model: this.graph,
			validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
				if (linkView.model.attributes.type === "fsa.OutputTransition") {
					// Link is an output
					if (cellViewS && (cellViewS.model.attributes.type === "fsa.Output"
						|| cellViewS.model.attributes.type === "fsa.Arrow"
						|| cellViewS.model.attributes.type === "fsa.OutputTransition")) {
						return false;
					} else if (cellViewT && (cellViewT.model.attributes.type === "fsa.State"
						|| cellViewT.model.attributes.type === "fsa.Arrow"
						|| cellViewT.model.attributes.type === "fsa.OutputTransition")) {
						return false;
					}
				} else {
					// Link is a state transition
					if (cellViewS && (cellViewS.model.attributes.type === "fsa.Output"
						|| cellViewS.model.attributes.type === "fsa.Arrow"
						|| cellViewS.model.attributes.type === "fsa.OutputTransition")) {
						return false;
					} else if (cellViewT && (cellViewT.model.attributes.type === "fsa.Output"
						|| cellViewT.model.attributes.type === "fsa.Arrow"
						|| cellViewT.model.attributes.type === "fsa.OutputTransition")) {
						return false;
					}
				}

				return true;
			}
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
		if (state.attributes.type === "fsa.State" || state.attributes.type === "fsa.Output")
			return state.attr("text/text");
		else
			return state.label(0).attrs.text.text;
	}

	GetTransitionLinks(element, opt) {
		const t_list = this.graph.getConnectedLinks(element, opt);

		// Trim out links that aren't transitions
		return t_list.filter(function (x) { return x.attributes.type === "fsa.Arrow" });
	}

	GetOutputLinks(element, opt) {
		const t_list = this.graph.getConnectedLinks(element, opt);

		// Trim out links that aren't transitions
		return t_list.filter(function (x) { return x.attributes.type === "fsa.OutputTransition" });
	}

	GetStates() {
		return this.graph.getElements().filter(function (x) { return x.attributes.type === "fsa.State" });
	}

	GetDefaultOutputs() {
		return this.graph.getElements().filter(function (x) { return x.attributes.type === "fsa.Output"
			&& this.graph.getConnectedLinks(x, { "inbound": true }).length === 0 }.bind(this));
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
	NewState(xpos, ypos, name, output_color, output=false) {
		if (output) {
			var state = new Joint.shapes.output.Element({
				position: { x: xpos, y: ypos },
				size: { width: 100, height: 40 },
				attrs: { text: { text: name } }
			});
			state.attr("rect/stroke", output_color);
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
		if (state.attributes.type === "fsa.State") {
			state.attr("circle/stroke", stroke);
		} else if (state.attributes.type === "fsa.Output") {
			state.attr("rect/stroke", output_color);
		} else if (state.attributes.type === "fsa.OutputTransition") {
			state.attr({ '.connection': { stroke: output_color } });
		} else {
			state.attr({ '.connection': { stroke: stroke } });
		}
	}

	// Set the text of the given cell to the given text
	_setCellText(state, text) {
		if (state.attributes.type === "fsa.State" || state.attributes.type === "fsa.Output") {
			// calculate the new width
			let new_width = 100;
			if ((Utils.GetLongestLine(text) * 10) + 25 > new_width) {
				new_width = (Utils.GetLongestLine(text) * 10) + 25;
			}

			// calculate the new height
			let new_height = 40;
			const split_str = text.split(/\r|\n/);
			if (split_str.length * 15 > new_height) {
				new_height = split_str.length * 15;
			}

			state.resize(new_width, new_height);
			state.attr("text/text", text);
		} else {
			state.label(0, { attrs: { text: { text: text } } });
		}
	}

	// Make a new link
	NewTransition(source, target, name, handle_cell_change_source, handle_cell_change_target, output_color, output=false) {
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
		this.SetCellStroke(cell_view.model, active_color, active_color);
		return cell_view.model;
	}

	HandleResizeWindow(width, height) {
		this.paper.setDimensions(width, height);
	}

	MovePaper(x, y) {
		this.paper.setOrigin(this.paper.options.origin.x + x, this.paper.options.origin.y + y);
	}

	ScalePaper(scale) {
		this.paper.scale(scale, scale);
	}

	GetStateNames() {
		const state_names = [];
		const elements = this.GetStates();
		for (let state = 0; state < elements.length; state++) {
			state_names.push({id: state, name: this.GetCellText(elements[state]) });
		}

		return state_names;
	}

	ShowHideNextStateLogic(show) {
		const links = this.graph.getLinks();
		const t_list = links.filter(function (x) { return x.attributes.type === "fsa.Arrow" });

		for (let link in t_list) {
			if (t_list.hasOwnProperty(link)) {
				if (show) {
					//t_list[link].removeAttr("./display");
					t_list[link].attr("./display", "");
				} else {
					t_list[link].attr("./display", "none");
				}	
			}
		}
	}

	ShowHideOutputLogic(show) {
		const links = this.graph.getLinks();
		const t_list = links.filter(function (x) { return x.attributes.type === "fsa.OutputTransition" });

		for (let link in t_list) {
			if (t_list.hasOwnProperty(link)) {
				if (show) {
					t_list[link].attr("./display", "");
				} else {
					t_list[link].attr("./display", "none");
				}	
			}
		}

		const outputs = this.graph.getElements();
		const s_list = outputs.filter(function (x) { return x.attributes.type === "fsa.Output" });

		for (let output in s_list) {
			if (s_list.hasOwnProperty(output)) {
				if (show) {
					s_list[output].attr("./display", "");
				} else {
					s_list[output].attr("./display", "none");
				}	
			}
		}
	}

	GetCellPosition(active_cell, scale) {
		const paper_location = this.paper.$el.offset();
		const origin = this.paper.options.origin;

		let cell_position;
		if (active_cell.attributes.type === "fsa.OutputTransition" || active_cell.attributes.type === "fsa.Arrow") {
			cell_position = {
				x: $(active_cell.findView(this.paper)._V.labels.node).offset().left + ($(active_cell.findView(this.paper)._V.labels.node).width() * 0.5),
				y: $(active_cell.findView(this.paper)._V.labels.node).offset().top + ($(active_cell.findView(this.paper)._V.labels.node).height() * 0.5)
			}
		} else {
			cell_position = {
				x: (active_cell.prop("position").x + active_cell.prop("size").width * 0.5) * scale + origin.x + paper_location.left,
				y: (active_cell.prop("position").y + active_cell.prop("size").height * 0.5) * scale + origin.y + paper_location.top
		}
	}

		return {
			x: cell_position.x,
			y: cell_position.y
		}
	}
}

export default JointGraph;