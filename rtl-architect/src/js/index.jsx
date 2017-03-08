// Pass along that the module loaded correctly
window.MODULE_LOADED = true;

/*****************************************************************************
 * Loads
 *****************************************************************************/

// MIT License
import "bootstrap/dist/css/bootstrap.css";
import Jumbotron from "react-bootstrap/lib/Jumbotron";
//import jQuery from "jquery";
//window.$ = window.jQuery = jQuery;

// BSD License
import React from "react";
import ReactDom from "react-dom";

// My loads
import BodyPane from "./BodyPane";
import "main.css";

const Title = () => {
	return (
		<div className="title-text" id="title-text">
			<Jumbotron><h1>RTL Architect</h1></Jumbotron>
		</div>
    );
};

///*****************************************************************************
// * Initialize everything
// *****************************************************************************/

ReactDom.render(<Title />, document.getElementById("title-text"));
ReactDom.render(<BodyPane />, document.getElementById("application"));