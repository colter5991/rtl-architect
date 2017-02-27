// ReSharper disable UnusedParameter
// Interface for the graph of the state transition diagram
class IGraph {
	// Should return a string
	GetCellText(state) {
		return this;
	}

	// Returns a list of links designated as state transitions.
	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getConnectedLinks
	// Returned links must have function getTargetElement() following the format:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Link.prototype.getTargetElement
	// This new function should return a state
	GetTransitionLinks(element, opt) {
		return this;
	}

	// Returns a list of links designated as outputs.
	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getConnectedLinks
	// Returned links must have function getTargetElement() following the format:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Link.prototype.getTargetElement
	// This new function should return a state
	GetOutputLinks(element, opt) {
		return this;
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getElements
	// Should return a list of states
	GetStates() {
		return this;
	}

	// Following the format of:
	// http://resources.jointjs.com/docs/jointjs/v1.0/joint.html#dia.Graph.prototype.getElements
	// Should return a list of default outputs
	GetDefaultOutputs() {
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