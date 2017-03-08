// MPL 2.0 License
import Joint from "jointjs";

Joint.shapes.DefaultOutput = Joint.shapes.basic.Rect.extend({
	markup: '<g class="rotatable"><g class="scalable"><rect /></g><text class="text1" /><text class="text2" /></g>',
	defaults: Joint.util.deepSupplement({
		type: "DefaultOutput"
	}, Joint.shapes.basic.Rect.prototype.defaults)
});

export default Joint.shapes.DefaultOutput;