// BSD License
import React from "react";

// MIT License
import {ReactElementResize} from "react-element-resize";

class InteractablePaper extends React.Component {
	render() {
		return (
			<pre>
				<div id="paper" className="paper" tabIndex="0" onKeyPress={this.props._handleKeyPress}
					onKeyDown={this.props._handleKeyDown} onWheel={this.props._handleScroll}>
					<ReactElementResize id="paper-resize" debounceTimeout={10} onResize={this.props._handleResizeWindow}></ReactElementResize>
				</div>
			</pre>
		);
	}
};

export default InteractablePaper;