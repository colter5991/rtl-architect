
/*****************************************************************************
 * Constants
 *****************************************************************************/
var inactiveColor = "black"   // The outline color of inactive graph elements
var activeColor = "blue"      // outline color of the active element
var paperWidth = 800;
var paperHeight = 600;

/*****************************************************************************
 * Global variables
 *****************************************************************************/
var graph;        // The joint.dia.Graph object
var paper;        // The joint.dia.Paper object
var activeCell;   // The active JointJs cell object

/*****************************************************************************
 * Object definitions
 *****************************************************************************/
 
function StateObject(model){
  this.name = getCellText(model);
  this.transitions = [];
  // Populate the transitions list
  linkList = graph.getConnectedLinks(model, {outbound: true})
  for (index in linkList){
    edge = linkList[index];
    target = edge.getTargetElement();
    if (target){
      this.transitions.push({target : getCellText(target), condition: getCellText(edge)});  
    }
  }
  this.transitionText = function(state){
    text = "\t\t" + state.name + ' : begin\n'
    for (index in state.transitions){
      condition = state.transitions[index].condition;
      target = state.transitions[index].target;
      //if (target == null) {continue;}
      text += "\t\t\t"
      if (index != 0) {text += "else ";}
      text += "if ( " + condition + " )\n"
      text += "\t\t\t\tnextState = " + target + ";\n"
    }
    text += "\t\tend\n\n"
    return text;
  }(this);
}

var StateData = {
  stateDict : {},
  edge : "Positive",
  reset : "Active High",
  init : "",
  
  getBitRange : function(){
    length = Object.keys(this.stateDict).length;
    var upperBit = length > 1 ? Math.ceil(Math.log2(length)) - 1: 0;
    return "[" + upperBit + ":0]"
  },
  
  populateStateDict : function(){
    this.stateDict = {}
    elements = graph.getElements()
    for (index in elements){
      cell = elements[index];
      state = new StateObject(cell);
      this.stateDict[state.name] = state;
    }
  },
  
  getEnumText : function(){
    enumText = "typedef enum bit " + this.getBitRange() + " {\n"
    for (stateName in this.stateDict){
      enumText += "\t" + stateName + ",\n"
    }
    enumText = enumText.substring(0,enumText.length-2) + "\n} StateType;\n\n";
    enumText += 'StateType state;\n';
    enumText += 'StateType nextState;\n\n';
    return enumText;
  },
  
  getTransitionText : function(){
    text =  "always_comb begin\n";
    text += "\t nextState = state;\n";
    text += "\t case(state)\n";
    for (stateName in this.stateDict){
      text += this.stateDict[stateName].transitionText;
    }
    text += "\tendcase\n"
    text += "end\n\n"
    return text;
  },
  
  getFFText : function(){
    // Determine the edge of the clock
    if (this.edge == "Positive")
      clockEdge = "posedge";
    else if (this.edge == "Negative")
      clockEdge = "negedge";
    else
      clockEdge = "";
      
    // Determine the edge of the reset
    if (this.reset == "Active High"){
      resetEdge = "posedge";
      resetCondition = "rst == 1";
    }
    else{
      resetCondition = "rst == 0";
      resetEdge = "negedge";
    }
    
    text = "always_ff @("+clockEdge+" clk, " + resetEdge + " rst) begin\n"
    text += "\tif ("+resetCondition+");\n";
    text += "\t\tstate <= "+this.init+";\n";
    text += "\telse\n"
    text += "\t\tstate <= nextState\n";
    text += "end\n\n";
    return text;
  },
  
  getVerilogHTML : function(){
    // Build up the text part by part
    html =  this.getEnumText();
    html += this.getTransitionText();
    html += this.getFFText();
    
    // Convert to a nice html format
    html = html.replace(new RegExp('\n', 'g'),'<br>');
    html = html.replace(new RegExp('\t', 'g'),'&nbsp&nbsp&nbsp&nbsp');
    return html;
  },
  
  update : function(){
    this.populateStateDict()
    html = this.getVerilogHTML();
    document.getElementById("verilog").innerHTML = html;
  },
}
 
/*****************************************************************************
 * Function definitions
 *****************************************************************************/

function isState(model){
  return model.attributes.type == "fsa.State";
}
 
// Append the given character to the end of the active cell string
function editActiveCellString(character){
  if (activeCell == null){
    return
  }
  var text = getCellText(activeCell);
  if (character)
    text += character
  else if (text != "")
    text= text.substring(0, text.length-1);
  setCellText(activeCell, text);
}

// Create a new State View
function newState(xpos, ypos, name){
  var state = new joint.shapes.fsa.State({
    position: {x: xpos, y: ypos},
    size: {width: 120, height:40},
    attrs: {text:{text:name}}
  });
  
  graph.addCell(state);
  StateData.update();
  
  return state;
}

// delete a given state
function deleteState(state){
  state.remove();
  StateData.update();
};

// Set the stroke of the given cell to the given color
function setCellStroke(state, stroke){  
  if (state.attributes.type == "fsa.State"){
    state.attr("circle/stroke", stroke);  
  }
  else{
    activeCell.attr({'.connection' : {stroke: stroke}})
  }
}

// Set the text of the given cell to the given text
function setCellText(state, text){
  if(state.attributes.type == "fsa.State")
    activeCell.attr("text/text", text)
  else
    state.label(0,{attrs:{text:{text: text}}})
    
  StateData.update();
}

// Get the text of the given cell
function getCellText(state){
  if(state.attributes.type == "fsa.State")
    return state.attr("text/text");
  else
    return state.label(0).attrs.text.text;
}

// inactivate the current active cell
function clearActiveCell(){
  if (activeCell)
    setCellStroke(activeCell, inactiveColor);
  activeCell = null;
}

// Make a new link
function newTransition(source, target, name){

  var cell = new joint.shapes.fsa.Arrow({
    source: source,
    target: target,
    labels: [{ position: 0.5, attrs: { text: { text: name || ''} } }],
  });
  
  cell.on("change:source", function(){StateData.update();});
  cell.on("change:target", function(){StateData.update();});
      
  graph.addCell(cell);
  return cell;
}

/*****************************************************************************
 * Initialization code
 *****************************************************************************/
function initGraph(){
  graph = new joint.dia.Graph();
  paper = new joint.dia.Paper({
      el: $('#paper'),
      width: paperWidth,
      height: paperHeight,
      gridSize: 1,
      model: graph
  });

  s1 = newState(100,100, "FOO");
  s2 = newState(100,400, "BAR");
  s3 = newState(400,100, "FOO_2");
  s4 = newState(400,400, "BAR_2");

  newTransition(s1, s2, "(x == y) || (z < w)");
  newTransition(s4, s3, "z[2] == x");
  newTransition(s3, s1, "(z[2] == y) && (x != y)");
  newTransition(s2, s4, "w & z & !x");
  newTransition(s4, s1, "z | w | (z ^ x)");
  StateData.update();


/*****************************************************************************
 * Event handlers
 *****************************************************************************/
 
  // Handle clicks (mainly select active element)
  paper.on('cell:pointerdown', function(cellView, evt, x, y){
    $("#paper").focus();
    clearActiveCell();
    activeCell = cellView.model;
    setCellStroke(activeCell, activeColor);
  });

  // Handle clicking on nothing
  paper.on('blank:pointerdown', function(cellView, evt, x, y){
    $("#paper").focus();
    clearActiveCell();
  });

  $("#paper").on("keydown", function(event){
    switch(event.which){
      case 46:
        deleteState(activeCell); break;
      case 83: // Letter s 
        if (event.ctrlKey && event.shiftKey) newState(paperWidth/2,paperHeight/2, "NEW_STATE");
        break;
      case 65: // Letter a 
        if (event.ctrlKey && event.shiftKey) newTransition({x:paperWidth/4,y:paperHeight/4},{x:paperWidth*3/4,y:paperHeight*3/4},'x==1 && y==0'); 
        break;
      case 8:
        editActiveCellString(null); break;
    }
  });

  $("#paper").on("keypress", function(event){
    if ((event.keyCode || event.which) == 32)
      event.preventDefault();
    editActiveCellString(String.fromCharCode(event.which));
  })
};


