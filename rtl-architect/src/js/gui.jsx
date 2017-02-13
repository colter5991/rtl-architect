// BSD License
var React = require('react');
var ReactDOM = require('react-dom');

import SplitPane from 'react-split-pane';

class BodyPane extends React.Component {
	render() {
		return (
			<SplitPane split="vertical">
				<div>
					<div id="tabs"></div>
					<div id="tabs-content">
						<div id="tab1-content">
						  <h2>Next State Logic</h2>
						  <hr />
						  <div id="paper" className="paper"></div>
						</div>
						<div id="tab2-content">
						  <h1>State Register</h1>
						  <p>Edit the flip-flop settings</p>
						  <div id="regForm">
							<div className="w2ui-field w2ui-span8">
							  <label>Clock Edge: </label>
							  <div>
								<input name="edge" type="text"></input>
							  </div>
							</div>
							<div className="w2ui-field w2ui-span8" >
							  <label>Reset: </label>
							  <div>
								<input name="reset" type="text"></input>
							  </div>
							</div>
							<div className="w2ui-field w2ui-span8" >
							  <label>Initial State: </label>
							  <div>
								<input name="init" type="text"></input>
							  </div>
							</div>
						  </div>
						</div>
						<div id="tab3-content">
						  <h1>Output Logic</h1>
						  <p>Click 'Add Record' to add a new output variable</p>
						  <p>Specify the value for each output variable for each state.  Using all constants results in a Moore machine, and using expressions
						  dependent on input variables results in a mealy machine.</p>
						  <p>An output variable will assume the default value for all states in which the value is not specified</p>
						  <div id="grid"></div>
						</div>
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