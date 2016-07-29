var mainContent = `
  <div id="tabs"></div>
  <div id="tabs-content" style="height: 800px; padding: 10px; border: 1px solid #ccc; border-top: 0px">
    <div id="tab1-content">
      <h1>Next State Logic</h1>
      <div id="paper" class="paper" tabindex="0"></div>
    </div>
    <div id="tab2-content">
      <h1>State Register</h1>
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
            { type: 'top',  size: 50, resizable: true, style: pstyle, content: 'top' },
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
    console.log(this.record);
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
  nameList = Object.keys(StateData.stateDict)
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
            footer: true,
            toolbarSave: true
        },
        columns: [                
            { field: 'recid', caption: 'ID', size: '50px', sortable: true, resizable: true },
            { field: 'var', caption: 'text', size: '120px', sortable: true, resizable: true, 
                editable: { type: 'text' }
            },
            { field: 'condition', caption: 'text', size: '120px', sortable: true, resizable: true, 
                editable: { type: 'text' }
            },

        ],
        toolbar: {
            items: [
                { id: 'add', type: 'button', caption: 'Add Record', icon: 'w2ui-icon-plus' }
            ],
            onClick: function (event) {
                if (event.target == 'add') {
                    w2ui.grid.add({ recid: w2ui.grid.records.length + 1 });
                }
            }
        },
        records: [
            { recid: 1, int: 100, money: 100, percent: 55, date: '1/1/2014', combo: 'John Cook', check: true },
            { recid: 2, int: 200, money: 454.40, percent: 15, date: '1/1/2014', combo: 'John Cook', check: false, list: { id: 2, text: 'Steve Jobs' } },
            { recid: 3, int: 350, money: 1040, percent: 98, date: '3/14/2014', combo: 'John Cook', check: true },
            { recid: 4, int: 350, money: 140, percent: 58, date: '1/31/2014', combo: 'John Cook', check: true, list: { id: 4, text: 'Mark Newman' } },
            { recid: 5, int: 350, money: 500, percent: 78, date: '4/1/2014', check: false },
            { recid: 6, text: 'some text', int: 350, money: 440, percent: 59, date: '4/4/2014', check: false },
            { recid: 7, int: 350, money: 790, percent: 39, date: '6/8/2014', check: false },
            { recid: 8, int: 350, money: 4040, percent: 12, date: '11/3/2014', check: true },
            { recid: 9, int: 1000, money: 3400, percent: 100, date: '2/1/2014',
                style: 'background-color: #ffcccc', editable: false }
        ]
    });    
}

$(function () {
  initGrid();
  initTabs();
  initRegSettings();
  initGraph();
  initTable();
  switchToTab("tab1",tabArr);
});