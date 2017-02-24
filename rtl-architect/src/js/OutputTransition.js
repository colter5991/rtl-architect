// MPL 2.0 License
import Joint from "jointjs";

Joint.shapes.outputTransition = {};
Joint.shapes.outputTransition.Element = Joint.shapes.fsa.Arrow.extend({
	defaults: Joint.util.deepSupplement({
		type: "fsa.OutputTransition",
		attrs: {
		}
	}, Joint.shapes.fsa.Arrow.prototype.defaults),
});

Joint.shapes.outputTransition.ElementView = Joint.dia.ElementView.extend({
});

export default Joint.shapes.outputTransition;