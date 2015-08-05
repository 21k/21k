var realtime = angular.module("realtime", ['ngRoute', 'ngTable', "highcharts-ng", 'filters', 'angularFileUpload', 'ng-sortable']),
    routes = [
        {url: "/", ngctrl: "addCtrl", templateUrl: "views/addChart.html"}//导航
    ];

//路由
realtime.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    routes.forEach(function (route, index) {
        $routeProvider.when(route.url,
            {
                controller: route.ngctrl,
                templateUrl: route.templateUrl
            }).otherwise({redirectTo: '/'})
    });
    $locationProvider.html5Mode(true);
}]);


//增加、编辑图表
realtime.controller("addCtrl", addCtrl);