// CREDIT: user2046417 - http://stackoverflow.com/questions/31671743/text-area-in-svg-shapes

// MIT License
//import jQuery from "jquery";
//window.$ = window.jQuery = jQuery;

// MPL 2.0 License
import Joint from "jointjs";


Joint.shapes.html = {};
Joint.shapes.html.Element = Joint.shapes.fsa.State.extend({
		defaults: Joint.util.deepSupplement({
		type: "html.Element",
		attrs: {
			rect: {stroke: 'none', 'fill-opacity': 0}
		}
	}, Joint.shapes.fsa.State.prototype.defaults)
});

Joint.shapes.html.ElementView = Joint.dia.ElementView.extend({
	template: [
		'<div class="html-element">',
		 '<button class="delete">x</button>',
		'<span></span>', '<br/>',
//                        '<input type="text" value="" />',
		'<textarea id="txt" type="text" rows="10" value="Start writing"></textarea>',
		'</div>'
	].join(''),
	initialize: function () {
		_.bindAll(this, 'updateBox');
		Joint.dia.ElementView.prototype.initialize.apply(this, arguments);

		this.$box = $(_.template(this.template)());
		// Prevent paper from handling pointerdown.
		this.$box.find('input,select').on('mousedown click', function (evt) {
			evt.stopPropagation();
		});

		this.$ruler = $('<span>', {style: 'visibility: hidden; white-space: pre'});
		$(document.body).append(this.$ruler);

		// This is an example of reacting on the input change and storing the input data in the cell model.
		this.$box.find('textarea').on('input', _.bind(function (evt) {

			var val = $(evt.target).val();
			this.model.set('textarea', val);
			this.$ruler.html(val);
			var width = this.$ruler[0].offsetWidth;
			var height = this.$ruler[0].offsetHeight;
			var area = width * height;
			height = area / 150;
			width = 150;
			if ((area > 9000)) 
			{
				this.model.set('size', {width: width + 50, height: height + 80});
				this.$box.find('textarea').css({width: width, height: height + 30});
				//                                this.$box.find('.color-edit').css({width: width + 50, height: height + 80});
				this.$box.find('.in').css({top: height + 75});
			}
		}, this));

		this.$box.find('textarea').on('click', _.bind(function () {
			this.$box.find('.delete').css({opacity: 1});
			this.$box.find('textarea').css({opacity: 1});
		}, this));

		this.$box.find('textarea').on('blur', _.bind(function () {
			this.$box.find('.delete').css({opacity: 0});
			this.$box.find('textarea').css({opacity: 0});
		}, this));

		this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
		// Update the box position whenever the underlying model changes.
		this.model.on('change', this.updateBox, this);
		// Remove the box when the model gets removed from the graph.
		this.model.on('remove', this.removeBox, this);

		this.updateBox();
		this.listenTo(this.model, 'process:ports', this.update);
		Joint.dia.ElementView.prototype.initialize.apply(this, arguments);
	},
	render: function () {
		Joint.dia.ElementView.prototype.render.apply(this, arguments);
		this.paper.$el.prepend(this.$box);
		this.updateBox();
		return this;
	},
	updateBox: function ()
	{
		// Set the position and dimension of the box so that it covers the JointJS element.
		var bbox = this.model.getBBox();
		// Example of updating the HTML with a data stored in the cell model.
		this.$box.find('label').text(this.model.get('label'));
		this.$box.find('span').text(this.model.get('select'));
		this.$box.css({width: bbox.width + 6, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)'});
	},
	removeBox: function (evt) {
		this.$ruler.remove();
		this.$box.remove();
	}
});
	
export default Joint.shapes.html;