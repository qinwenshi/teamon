var doc = {

};

var tableLayout = [
    [
        { title: "关键合作",
          icon: "link",
          key: "keyPartners",
          rowspan: 2,
          colspan: 2 },

        { title: "核心业务",
          icon: "check",
          key: "keyActivities",
          rowspan: 1,
          colspan: 2 },

        { title: "价值主张",
          icon: "gift",
          key: "valuePropositions",
          rowspan: 2,
          colspan: 2 },

        { title: "客户关系",
          icon: "heart",
          key: "customerRelationships",
          rowspan: 1,
          colspan: 2 },

        { title: "客户细分",
          icon: "user",
          key: "customerSegments",
          rowspan: 2,
          colspan: 2 }
    ], [
        { title: "核心资源",
          icon: "tree-deciduous",
          key: "keyResources",
          rowspan: 1,
          colspan: 2 },

        { title: "渠道通路",
          icon: "send",
          key: "channels",
          rowspan: 1,
          colspan: 2 }
    ], [
        { title: "成本结构",
          icon: "tags",
          key: "costStructure",
          rowspan: 1,
          colspan: 5 },

        { title: "收入来源",
          icon: "usd",
          key: "revenueStreams",
          rowspan: 1,
          colspan: 5 }
    ]
];

var app = angular.module('BusinessModelCanvas', ['ui.keypress', 'LocalStorageModule', 'ngTouch', 'integralui'])
.config(function(localStorageServiceProvider){
  localStorageServiceProvider.setPrefix('bmc');
});

app.controller('RootController', ["$scope", 'localStorageService', "$timeout", "IntegralUIMenuService", 
  function($scope, localStorageService, $timeout, $menuService) {
    var storedBusinessModel = localStorageService.get('localBusinessModel');
    var storedHistory = localStorageService.get('localHistory');
    $scope.doc = storedBusinessModel || doc;
    $scope.history = storedHistory || [];

    $scope.tableLayout = tableLayout;

    $scope.menuName = "localHistory";
    $scope.defaultIcon = 'icons-medium empty';
    $scope.menuData = [];

    $scope.dataSource = [];
                
    $scope.dataFields = {
                    icon: 'menuIcon',
                    id: 'menuId',
                    items: 'children',
                    pid: 'parentId',
                    text: 'menuText'
    }

    function loadHistoryMenu(){
    var initTimer = $timeout(function(){
                    listHistorySource();
                    $menuService.loadData($scope.menuName, $scope.dataSource, null, $scope.dataFields, true);
                    $timeout.cancel(initTimer);
                }, 1);
    };

    loadHistoryMenu();

    function listHistorySource(){
      $scope.dataSource = [];
      var menuItem ={   
          menuId: 1,
          menuText: "历史版本",
          menuIcon: "icons-medium library",
          children: []
      }
      
       $($scope.history).each(function(i, value){
        var childItem = {
          menuId: '1'+ i,
          menuText: value.version
        }
        menuItem.children.push(childItem);
      });
       $scope.dataSource.push(menuItem)
    }

    $scope.$watch('doc', function(){
        localStorageService.set('localBusinessModel', $scope.doc);
    }, true);

    $scope.$watch('history', function(){
        localStorageService.set('localHistory', $scope.history);
        loadHistoryMenu();
    }, true);

    $scope.snapShot = function(){
        var snap = getCurrentSnapShot();
        var d=new Date();
        var versionInfo = d.toLocaleDateString() + " " + d.toLocaleTimeString()
        $scope.history.push({version: versionInfo, content: snap})
    };

    $scope.loadItem = function(e){
      arr = jQuery.grep($scope.history, function( item, i ) {
        return ( item.version == e.item.menuText );
      });
      if(arr.length > 0)
        loadFromStr(arr[0].content);
    };
    $scope.clearAll = function(){
      (localStorageService.clearAll)();
      $scope.doc = doc;
      $scope.history = [];
    };

    function loadFromStr(docStr){
      if(docStr != null){
        var lines = docStr.split('\n');
          if(lines.length >= 1) {
          
          $.removePostItAll();
          
          for(var i = 0;i < lines.length;i++) {
              if(lines[i]) {
                var o = JSON.parse(lines[i]+'\n');
                o.newPostit = true;
              $('#'+o.belongsTo).postitall(o);
              }
          }
        } 
      }
    };

    $scope.loadFrom = function(){
      var docStr = prompt("Please enter saved data", "{}");
      loadFromStr(docStr);

    };

    function getCurrentSnapShot(){
      var val = '';
      $('.PIApostit').each(function() {
        val += JSON.stringify($(this).postitall('options'))+'\n';
      });
      return val;
    }
}]);

app.controller('SectionController', function($scope) {

    function getRandomColor() {
      var colors = ['#D1A60D', '#65853F', '#33A6CC', '#CA2617', '#F4C824', '#919E39', '#4ABEE4', '#DF3513'];
      return colors[Math.floor(Math.random() * 8)];
    }

    $scope.addPostIt = function($event) {
        var element = $event.target;
        $(element).postitall({
          'textcolor'       : '#2B2C2B',
          'backgroundcolor' : getRandomColor(),
          'description'     : 'New Item',
          'newPostit'       : true,
          'autoheight'      : true,
          'height'          : 20, //height
          'width'           : 70, //width
          'minHeight'       : 20, //resizable min-width
          'minWidth'        : 70, //resizable min-height
          'belongsTo'       : element.id
        });
    };
});

app.directive('bmcFocusWhen', function($timeout) {
    return {
        scope: { bmcFocusWhen: "=" },
        link: function(scope, element, attrs) {
            scope.$watch('bmcFocusWhen', function(value) {
                if(value) {
                    $timeout(function() { element[0].focus(); });
                }
            });
        }
    };
});

app.directive('bmcEditableLabel', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: { model: '=', justAdded: '='},
        templateUrl: 'editableLabel.html',
        link: function(scope, element, attrs) {
            scope.editing = scope.justAdded;
            scope.edit = function() {
                scope.editing = true;
            };

            scope.stopEditing = function() {
                scope.editing = false;
            };
        }
    };
});


app.directive('bmcSelectAll', function($parse, $timeout) {
   return {
       restrict: 'A',
       link: function(scope, element, attrs) {
           if($parse(attrs.bmcSelectAll)(scope)) {
               $timeout(function() { element[0].select(); });
           }
       }
   };
});

