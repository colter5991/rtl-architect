/*****************************************************************************
 * HTML
 *****************************************************************************/

var topContent = `
  <h1 class="title" style="text-align: center;">RTL Architect</h1>
  <h2 class="title" style="text-align: center;">(v0.0.1)</h2>
`

var mainContent = `
  <div id="tabs"></div>
  <div id="tabs-content" style="height: 600px; padding: 10px; border: 1px solid #ccc; border-top: 0px">
    <div id="tab1-content">
      <h2>Next State Logic</h2>
	  <hr>
      <div id="paper" class="paper" tabindex="0"></div>
    </div>
    <div id="tab2-content">
      <h1>State Register</h1>
      <p>Edit the flip-flop settings</p>
      <div id="regForm">
        <div class="w2ui-field w2ui-span8"  style="clear: both">
          <label>Clock Edge: </label>
          <div>
            <input name="edge" type="text" maxlength="100" style="width: 300px !important">
          </div>
        </div>
        <div class="w2ui-field w2ui-span8" >
          <label>Reset: </label>
          <div>
            <input name="reset" type="text" maxlength="100" style="width: 300px !important">
          </div>
        </div>
        <div class="w2ui-field w2ui-span8" >
          <label>Initial State: </label>
          <div>
            <input name="init" type="text" maxlength="100" style="width: 300px !important">
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
      
      <div id="grid" style="width: 100%; height: 400px;"></div>
    </div>
  </div>   
`

var rightContent = `
  <h2>Verilog Code</h2>
  <hr>
  <div id="verilog">
  </div>
`

/*****************************************************************************
 * Global variables
 *****************************************************************************/

var tabArr = [
  {name:"tab1", onSwitch: function(){}},
  {name:"tab2", onSwitch: updateRegForm},
  {name:"tab3", onSwitch: updateGrid}
];

/*****************************************************************************
 * Functions
 *****************************************************************************/

function initGrid(){
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'top',  size: 45, resizable: false, style: pstyle + ' text-align: center', content: topContent },
            { type: 'main', style: pstyle, content: mainContent,
              tabs: {
                name: 'tabs',
                active: 'tab1',
                tabs: [
                  { id: 'tab1', caption: 'Next State Logic' },
                  { id: 'tab2', caption: 'State Register'},
                  { id: 'tab3', caption: 'Output Logic'},
                ],
                onClick: function (event) {
                  switchToTab(event.target, tabArr);
                }
              }
            },
            { type: 'right', size: 400, resizable: true, style: pstyle, content: rightContent },
        ]
    });
}
  
function switchToTab(currentTab, tabArr){
  for (var tabIndex in tabArr ){
    var tab = tabArr[tabIndex].name;
    tabObject = $('#'+tab+"-content");
    if (tab == currentTab){
      tabObject.css("display", "block");
      tabArr[tabIndex].onSwitch();
    }
    else{
      tabObject.css("display", "none");
      //updateRegForm();
      //w2ui['regForm'].refresh();
      //w2ui['grid'].refresh();
    }
  }
  if(currentTab == "tab1"){
    $("#paper").focus();
  }
}

function initRegSettings(){
  $('#regForm').w2form({
    name : 'regForm',
    header: 'Register Settings',
    fields : [
      {
        name: 'edge',
        type : 'list', 
        options : {
        items: ['Positive', 'Negative', 'Both'],
        },
      },
      
      {
        name: 'reset',
        type : 'list', 
        options : {
        items: ['Active High', 'Active Low'],
        },
      },
      {
        name: 'init',
        type : 'list', 
        options : {
        items: [],
        },
      },
    ]
  });
  
  
  w2ui['regForm'].on('change', function (event) { event.onComplete = function(event){
    if(w2ui['regForm'].record.edge)
      StateData.edge = w2ui['regForm'].record.edge.text;
    if(w2ui['regForm'].record.reset)
      StateData.reset = w2ui['regForm'].record.reset.text;  
    if(w2ui['regForm'].record.init)
      StateData.init = w2ui['regForm'].record.init.text;  
    StateData.update();
  }});
}

function updateRegForm(){
  itemList = []
  nameList = graph.getElements().map(getCellText);
  for (index in nameList){
    state = nameList[index];
    itemList.push({id:state, name:state, text:state})
  }
  w2ui['regForm'].fields[2].options.items = itemList
  w2ui['regForm'].refresh()
}

function initTable() {
  $('#grid').w2grid({ 
      name: 'grid', 
      show: { 
          toolbar: true,
          footer: false,
          toolbarSave: false,
      },
      columns: [                
          { field: 'variable', caption: 'Variable Name', size: '120px', sortable: true, resizable: true, 
              editable: { type: 'text' }
          },
          { field: 'default', caption: 'Default Value', size: '120px', sortable: true, resizable: true, 
              editable: { type: 'text' }
          },
      ],
      toolbar: {
          items: [
              { id: 'add', type: 'button', caption: 'Add Record', icon: 'w2ui-icon-plus' }
          ],
          onClick: function (event) {
              if (event.target == 'add') {
                  w2ui.grid.add({ recid: w2ui.grid.records.length + 1, variable:"VAR"+(w2ui.grid.records.length + 1), 'default': 0 });
              }
          }
      },
      records: [
          { recid: 1, variable:'Y', default: 0},
      ],
      
      onChange : function(event){ event.onComplete = function(event){
        this.save();
        StateData.update();
      }}
  }); 

  // Re-implement save and merge function because the built in implementation
  // doesn't like field names with dashes in them
  w2ui['grid'].save = function(){
    changes = this.getChanges();
    for (cIndex in this.getChanges()){
      change = changes[cIndex];
      record = this.get(change.recid);
      for (item in change){
        if(item != 'recid')
          record[item] = change[item];
      }
      delete record.changes;
    }
  }
  w2ui['grid'].refresh()
}


// This should be called whenever the grid tab is opened.  It updates the state names.
function updateGrid(){
  stateList = graph.getElements()
  var stateDict = {};
  for (index in stateList){
    state = stateList[index];
    stateDict[state.id] = getCellText(state);
  }
  for (columnIndex in w2ui['grid'].columns.slice(0,-2)){
    columnIndex = Number(columnIndex)+2;
    w2ui['grid'].columns[columnIndex].caption = stateDict[w2ui['grid'].columns[columnIndex].field];
  }
  w2ui['grid'].refresh();
  
}

/*****************************************************************************
 * Initialize everything
 *****************************************************************************/

$(function () {
  initGrid();
  initRegSettings();
  initTable();
  initGraph();
  switchToTab("tab1",tabArr);
});