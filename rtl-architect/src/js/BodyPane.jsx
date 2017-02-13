// BSD License
import React from 'react';

// MIT License
import SplitPane from 'react-split-pane';
import 'SplitPane.css';
import 'BodyPane.css';
import Button from 'react-bootstrap/lib/Button';

class BodyPane extends React.Component {
	render() {
		return (
			<SplitPane split="vertical" minSize={100}
					defaultSize={document.documentElement.clientWidth / 2}
					primary="second">
				<div className="window">
						<h2>Next State Logic</h2>
						<div id="paper" className="paper"></div>
				</div>
				<div className="window">
					<h2>Verilog Code</h2>
					<div id="verilog"></div>
				</div>
			</SplitPane>
		);
	}
};

//<div>
//						<h2>Output Logic</h2>
//						<p>Click 'Add Record' to add a new output variable</p>
//						<p>Specify the value for each output variable for each state.  Using all constants results in a Moore machine, and using expressions
//						dependent on input variables results in a mealy machine.</p>
//						<p>An output variable will assume the default value for all states in which the value is not specified</p>
//						<div id="grid"></div>
//					</div>

export default BodyPane;