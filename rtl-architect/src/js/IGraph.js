﻿// ReSharper disable UnusedParameter
// Interface for the graph of the state transition diagram
class IGraph {
	// Should return a string
	GetCellText(state) {
		return this;
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getConnectedLinks
	// Returned element must have function getTargetElement() following the format:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Link.prototype.getTargetElement
	// This new function should return a state
	GetConnectedLinks(element, opt) {
		return this;
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getElements
	// Should return a list of states
	GetElements() {
		return this;
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getCell
	// Should return a state
	GetCell(state_id) {
		return this;
	}
}

export default IGraph;