function addCtrl($scope, $rootScope, $location, $routeParams, chartLang) {
    var tmp1, tmp2;
    $scope.chartLang = chartLang;
    $scope.isEdit = ($routeParams.id && $routeParams.id.length == 24);
    iniScope($scope, $location.$$path);
    $scope.userinfo = $rootScope.userInfo;
    $scope.gData = setdata;

    //投资领域
    $scope.invests = angular.copy($scope.gData.dataSet[2].data).map(function (item) {
        return {check: false, data: item}
    });


    //数据值
    $scope.calcVal2 = calcVal2;

    //关闭tab
    $scope.closeTab = function (tabs, tab, obj, type) {
        var i = 1;
        $scope[tabs].forEach(function (item, index) {
            if (item.field == tab.field) {
                i = index;
                $scope[tabs].splice(index, 1)
            }
        });
        $scope[obj].cols.forEach(function (item, index) {
            if (item.field == tab.field) {
                $scope[obj].cols.splice(index, 1)
            }
        });

        $scope[obj].data = col2row($scope[obj].cols);
        $scope.showTab(Math.max(0, i - 1), type);
    };
    //增加新tab
    $scope.addTab = function (tabs, obj, type) {
        var name = randomChar();
        var color = chartLang.colors[$scope[tabs].length % chartLang.colors.length];
        $scope[tabs].push({
            "id": name,
            "field": name,
            "name": name,
            "dataLabels": {
                "enabled": false,
                "color": color,
                "style": {
                    "fontSize": "12px",
                    "textShadow":"none"
                }
            },
            "dashStyle": "Solid",
            "type": "line",
            "marker": {
                "symbol": "circle",
                "fillColor": color,
                "lineWidth": 2,
                "lineColor": color,
                "enabled": false
            },
            "color": color,
            "lineWidth": 2,
            "visible": true,
            data: rangeRnd([-5, 20])
        });

        $scope.showTab($scope[tabs].length - 1, type);

        $scope[obj].cols.push({field: name, data: rangeRnd(0.1)});
        $scope[obj].data = col2row($scope[obj].cols);

    };

    //增加规则
    $scope.calcRule = function (tab, obj) {
        $scope[obj].cols.forEach(function (item) {
            if (item.field == tab.field) item.data = [tab.rule]
        });
        $scope[obj].data = col2row($scope[obj].cols);
    };

    //图tab拖动
    $scope.chartTabConfig = $scope.tabConfig('#addTab1', '#setzone1', 'c');

    realTimeChart($scope, $scope.chartTemplate, "chart33");

    setInterval(function () {
        angular.element(".theCover").height(angular.element("body").height())
    }, 10)

    $scope.toJson = function (t) {
        $scope.result = JSON.stringify(JSON.parse($scope.result), null, t ? 10 : 0)
    }

}