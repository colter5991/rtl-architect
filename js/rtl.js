
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
  for (index in graph.attributes.cells.models){
    edge = graph.attributes.cells.models[index];
    if (!isState(edge) && edge.attributes.source == model){
      this.transitions.push({target : getCellText(edge.attributes.target), condition: getCellText(edge)});  
    }
  }
}

var StateData = {
  stateDict : {},
  getBitRange : function(){
    var upperBit = this.stateArray.length > 1 ? Math.ceil(Math.log2(this.stateArray.length)) - 1: 0;
    return "[" + upperBit + ":0]"
  },
  populateStateDict : function(){
    for (index in graph.attributes.cells.models){
      cell = graph.attributes.cells.models[index];
      if (isState(cell)){
        state = new StateObject(cell);
        this.stateDict[state.name] = state;
      }
    }
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
  return state;
}

// delete a given state
function deleteState(state){
  state.remove();
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

/*
  s1 = new joint.shapes.fsa.State({
      position: { x: 100, y: 30 },
      size: { width: 100, height: 30 },
      attrs: {text: { text: 'FOO', fill: 'black' } }
  });
  
  s2 = new joint.shapes.fsa.State({
      position: { x: 400, y: 30 },
      size: { width: 100, height: 30 },
      attrs: {text: { text: 'BAR', fill: 'black' } }
  });
*/
  s1 = newState(100,100, "FOO");
  s2 = newState(100,400, "BAR");
  s3 = newState(400,100, "FOO_2");
  s4 = newState(400,400, "BAR_2");

  newTransition(s1, s2, "(x == y) || (z < w)");
  newTransition(s4, s3, "z[2] == x");
  newTransition(s3, s1, "(z[2] == y) && (x != y)");
  newTransition(s2, s4, "w & z & !x");
  newTransition(s4, s1, "z | w | (z ^ x)");
  


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


