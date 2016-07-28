var mainContent = `
  <div id="tabs"></div>
  <div id="tabs-content" style="height: 800px; padding: 10px; border: 1px solid #ccc; border-top: 0px">
    <div id="tab1-content">
      <div id="paper" class="paper" tabindex="0"></div>
    </div>
    <div id="tab2-content">
      <h1>other thing</h1>
    </div>
    <div id="tab3-content">
      <h1>last thing</h1>
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
    console.log(tab + " " + currentTab)
    if (tab == currentTab){
      console.log(tabObject);
      tabObject.css("display", "block");
    }
    else
      tabObject.css("display", "none");
  }
  if(currentTab == "tab1"){
    $("#paper").focus();
  }
}


$(function () {
  initGrid();
  initTabs();
  initGraph();
  switchToTab("tab1",tabArr);
});