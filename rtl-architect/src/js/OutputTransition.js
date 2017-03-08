// MPL 2.0 License
import Joint from "jointjs";

Joint.shapes.OutputTransition = Joint.shapes.fsa.Arrow.extend({
	defaults: Joint.util.deepSupplement({
		type: "OutputTransition",
		attrs: {
		}
	}, Joint.shapes.fsa.Arrow.prototype.defaults)
});

export default Joint.shapes.OutputTransition;