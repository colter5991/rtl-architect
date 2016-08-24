var topContent = `
  <h1 class="title">State Machine Designer</h1>
  <h2 class="title">(v0.0.0)</h2>
`

var mainContent = `
  <div id="tabs"></div>
  <div id="tabs-content" style="height: 600px; padding: 10px; border: 1px solid #ccc; border-top: 0px">
    <div id="tab1-content">
      <h1>Next State Logic</h1>
      <p>Use ctrl+shift+s to add a new state and ctrl+shift+a to add a new transition</p>
      <p>Click a state/transition to make it active (highlighed in blue)</p>
      <p>Press 'delete' to delete the active transition. Type or use backspace to edit the state name or transition condition </p>
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

var tabArr = ["tab1", "tab2", "tab3"];

var tabContent = `

`

function initGrid(){
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        panels: [
            { type: 'top',  size: 60, resizable: true, style: pstyle, content: topContent },
            { type: 'main', style: pstyle, content: mainContent },
            { type: 'right', size: 400, resizable: true, style: pstyle, content: rightContent },
            { type: 'bottom', size: 50, resizable: true, style: pstyle, content: 'bottom' }
        ]
    });
}

function initTabs(){
  $('#tabs').w2tabs({
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
  });
}
  
function switchToTab(currentTab, tabArr){
  for (var tabIndex in tabArr ){
    var tab = tabArr[tabIndex];
    tabObject = $('#'+tab+"-content");
    if (tab == currentTab){
      tabObject.css("display", "block");
    }
    else{
      tabObject.css("display", "none");
      updateRegForm();
      w2ui['regForm'].refresh();
      w2ui['grid'].refresh();
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
  nameList = graph.getElements().map(function (x) {getCellText(x)});
  for (index in nameList){
    state = nameList[index];
    itemList.push({id:state, name:state})
  }
  
  w2ui['regForm'].fields[2].options.items = itemList
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

$(function () {
  initGrid();
  initTabs();
  initRegSettings();
  initTable();
  initGraph();
  switchToTab("tab1",tabArr);
  alert('Warning! State Machine Designer has only been tested on Chrome and Firefox.  It might not work properly in other browsers!');
});