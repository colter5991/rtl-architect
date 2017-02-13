// BSD License
import React from 'react';

// MIT License
import SplitPane from 'react-split-pane';
import 'SplitPane.css';
import Button from 'react-bootstrap/lib/Button';

class BodyPane extends React.Component {
	render() {
		return (
			<SplitPane split="vertical">
				<div>
					<div>
						<h2>Next State Logic</h2>
						<hr />
						<div id="paper" className="paper"></div>
					</div>
					<div>
						<h1>Output Logic</h1>
						<p>Click 'Add Record' to add a new output variable</p>
						<p>Specify the value for each output variable for each state.  Using all constants results in a Moore machine, and using expressions
						dependent on input variables results in a mealy machine.</p>
						<p>An output variable will assume the default value for all states in which the value is not specified</p>
						<div id="grid"></div>
					</div>
				</div>
				<div>
					<h2>Verilog Code</h2>
					<hr />
					<div id="verilog"></div>
				</div>
			</SplitPane>
		);
	}
};

export default BodyPane;