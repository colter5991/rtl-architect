// MPL 2.0 License
import Joint from "jointjs";

Joint.shapes.output = {};
Joint.shapes.output.Element = Joint.shapes.basic.Rect.extend({
	defaults: Joint.util.deepSupplement({
		type: "fsa.Output",
		attrs: {
		}
	}, Joint.shapes.basic.Rect.prototype.defaults),
});

Joint.shapes.output.ElementView = Joint.dia.ElementView.extend({
});

export default Joint.shapes.output;