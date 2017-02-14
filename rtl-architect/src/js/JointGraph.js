import IGraph from "./IGraph";

class JointGraph extends IGraph {
	// Takes in a jointjs graph object
	constructor(graph) {
		this.graph = graph;
	}

	// Should return a string
	GetCellText(state) {
		if (!state)
			return null;
		if (state.attributes.type == "fsa.State")
			return state.attr("text/text");
		else
			return state.label(0).attrs.text.text;
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getConnectedLinks
	// Returned element must have function getTargetElement() following the format:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Link.prototype.getTargetElement
	// This new function should return a state
	GetConnectedLinks(element, opt) {
		return this.graph.getConnectedLinks(element, opt);
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getElements
	// Should return a list of states
	GetElements() {
		return this.graph.getElements();
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getCell
	// Should return a state
	GetCell(state_id) {
		return this.graph.GetCell(state_id);
	}
}

export default JointGraph;