function addCtrl($scope, $rootScope, $location, $routeParams, dataService, chartLang) {
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
    //上传控件
    $scope.uploader = dataService.upImage();
    $scope.uploader.onSuccessItem = function (item, res, status, headers) {
        if (status == 200 && res.msg == "success") {
            $scope.AddData.image = res.data.url;
        }
    };
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
        $scope[tabs].push({
            name: '未命名图',
            id: name,
            field: name,
            type: "line",
            marker: {
                symbol: "circle",
                enabled: false,
                lineWidth: 4
            },
            dataLabels: {
                enabled: false,
                color: "#ff0000",
                style: {
                    "fontSize": "12px"
                }
            },
            tooltip: {
                pointFormat: "<span style=color:{series.color}>{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>"
            },
            visible: true,
            color: "#ff0000",
            lineWidth: 1,
            dashStyle: "Solid",
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

    $scope.toJson=function(t) {
        $scope.result = JSON.stringify(JSON.parse($scope.result), null, t ? 10 : 0)
    }

}