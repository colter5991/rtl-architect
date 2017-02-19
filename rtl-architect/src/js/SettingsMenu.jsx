// BSD License
import React from "react";

import "SettingsMenu.css";

class SettingsMenu extends React.Component {
	render() {
		return (
			<div
				className="settings-popdown-menu"
				style={{
				...this.props.style,
				position: 'absolute',
				backgroundColor: '#EEE',
				boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
				border: '1px solid #CCC',
				borderRadius: 3,
				marginLeft: -5,
				marginTop: 5,
				padding: 10,
				}}
			>
				<label>Clock Edge:</label>
				<select value={this.props.clockEdge} id="clock-edge" onChange={this.props.handleEdge}>
					<option value="Positive">Positive</option>
					<option value="Negative">Negative</option>
					<option value="Both">Both</option>
				</select>
				<br />
				<label>Reset:</label>
					<select value={this.props.reset} id="reset" onChange={this.props.handleReset}>
					<option value="Active High">Active High</option>
					<option value="Active Low">Active Low</option>
				</select>
				<br />
				<label>Initial State:</label>
				<select value={this.props.initialState} style={this.props.initialState === "" ? {color: "red"} : {}} id="initial-state" onChange={this.props.handleInitialState}>
					<option value="">select a state</option>
					{this.props.stateNames.map(state => (
						<option key={state.id} value={state.name}>{state.name}</option>
					))}
				</select>
			</div>
		);
	}
};

export default SettingsMenu;