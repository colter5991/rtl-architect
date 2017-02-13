var React = require('react');
var ReactDOM = require('react-dom');

require('hello.css');

class Hello extends React.Component {
	render() {
		return (
			<h1>Hello Worlds</h1>
		);
	}
};

export default Hello;