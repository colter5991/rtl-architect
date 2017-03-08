// MPL 2.0 License
import Joint from "jointjs";

Joint.shapes.Output = Joint.shapes.basic.Rect.extend({
	defaults: Joint.util.deepSupplement({
		type: "Output",
		attrs: {
		}
	}, Joint.shapes.basic.Rect.prototype.defaults)
});

export default Joint.shapes.Output;