function realTimeChart($scope, chartTemplate, chartName) {
    $scope.chartIndex = 0;
    $scope.axisIndex = -1;
    $scope.chartSet.cols = [];
    $scope.chartSet.data = [];

    if (chartTemplate.size) $scope.chartSet.size = chartTemplate.size;
    if (chartTemplate.yAxis) $scope.chartSet.yAxis = chartAxis(chartTemplate.yAxis);
    if (chartTemplate.xAxis) $scope.chartSet.xAxis = chartTemplate.xAxis;
    if (chartTemplate.theme) $scope.chartSet.theme = chartTemplate.theme;

    $scope.chartSet.tabs = $scope.chartTabs = chartTemplate.series.map(function (item) {
        // 有下拉菜单空值
        if (!item.type) item.type = 'line';
        if (!item.marker.symbol) item.marker.symbol = 'circle';
        if (!item.yAxis) item.yAxis = 0;
        if (typeof(item.visible) == "undefined") item.visible = true;
        if (typeof(item.more) == "undefined") item.more = true;

        $scope.chartSet.cols.push({field: item.field, data: item.data});
        return item;
    });

    $scope.chartSet.data = col2row($scope.chartSet.cols);

    var LessT = function (t) {
        if (t.series && t.series.length) {
            angular.forEach(t.series, function (item) {
                item.id = item.field;
                if (t.yAxis && t.yAxis.length && item.yAxis) {
                    angular.forEach(t.yAxis, function (y) {
                        if (y.id == item.yAxis) item.yAxis = y.field;
                    })
                }
                delete item.data;
                return item.data
            })
        }
        if (t.yAxis && t.yAxis.length) {
            angular.forEach(t.yAxis, function (item) {
                item.id = item.field;
                return item.data;
            })
        }
        return t;
    };

    var toResult = function ($scope) {
        //投资领域
        $scope.AddData.invests = angular.copy($scope.invests).filter(function (item) {
            return item.check
        }).map(function (item) {
            return item.data
        });
        var num=($scope.resultFormat.check)?10:0;
        console.log(num)
        $scope.result = JSON.stringify(angular.extend({}, $scope.AddData, {template: LessT(angular.copy(chartTemplate))}),null,num);

    };
    $scope.$watch('AddData', function (n, o) {
        toResult($scope);
    },true);

    // 监视其他配置
    $scope.$watch('chartSet', function (newSeries) {
        //监视曲线系列

        chartTemplate.series = newSeries.tabs;

        //监视大小
        if (newSeries.size && newSeries.size.width && newSeries.size.height) {
            chartTemplate.size = newSeries.size;
        }

        // 监视Y坐标轴变换
        if (newSeries.yAxis.length) chartTemplate.yAxis = newSeries.yAxis;

        //监视X坐标轴变换
        chartTemplate.xAxis = newSeries.xAxis;

        //监视标题
        chartTemplate.title = {text: $scope.AddData.title};

        chartTemplate.theme = newSeries.theme;
        chartTemplate.useHighStocks = newSeries.theme;
        toResult($scope);
        //重绘
        paintChart($scope, chartName, chartTemplate, $scope.chartSet.cols);
    }, true);
}

//绘制图表
function paintChart($scope, chartName, template, cols) {
    $scope.chartTemplateCopy = angular.copy(template);
    var xAxis = new xAxisSet($scope.chartTemplateCopy, cols);
    xAxis.xPointAdd();
    chartAxis($scope.chartTemplateCopy.yAxis);
    console.log($scope.chartTemplateCopy)
    if ($scope.chartTemplateCopy.series.length == 0)
        $scope.chartTemplateCopy.useHighStocks = true;
    $scope[chartName] = $scope.chartTemplateCopy;
}

//x轴，插入时间序列
function xAxisSet(chartTemplate, cols) {
    var ok = !!(chartTemplate.xAxis && chartTemplate.xAxis.length && chartTemplate.xAxis[0].id), hasid = false;
    if (ok && cols.length) {
        cols = cols.filter(function (col) {
            return col.field == chartTemplate.xAxis[0].id;
        });
        hasid = !!cols.length;
    }
    this.xPointAdd = function () {
        chartTemplate.series.forEach(function (item) {
            if (!item.data) item.data = [];
            item.data = item.data.map(function (y, index) {
                if (ok)//设置了x轴id
                {

                    //这儿可以设置关键点，如8<y<10，加属性即可
                    return {x: timeSeries(index), y: y}
                }
                return y;
            });
        });
    };
}


//添加轴函数
function chartAxis(yAxis) {
    return (typeof(yAxis) != "undefined") ? yAxis.map(function (item) {
        if (!item.labels)
            item.labels = {};
        if (typeof(item.unit) == "undefined")
            item.unit = "";
        item.labels.formatter = function () {
            this.axis.options.lineColor = this.axis.options.title.style.color;
            this.axis.options.tickWidth = 1;
            this.axis.options.tickColor = this.axis.options.title.style.color;
            this.axis.options.labels.style.color = this.axis.options.title.style.color;
            return this.value + this.axis.options.unit;
        };
        return item;
    }) : [];
}

//初始scope
function iniScope($scope, type) {
    $scope.AddData = {};
    $scope.AddData.image = "";
    $scope.AddData.username = "WeilinLin";
    $scope.AddData.invests = [];
    $scope.AddData.data_for = "chart";
    $scope.AddData.status = "已上线";
    $scope.AddData.public = "open";
    $scope.AddData.data_for = "table";
    $scope.AddData.store_type = "REDIS";
    $scope.AddData.data_type = "日间数据";
    $scope.resultFormat={check:true};
    //切换标签
    $scope.showTab = function (index, type) {
        if (type == "t")
            $scope.tableIndex = index;
        if (type == "c")
            $scope.chartIndex = index;
    };
    //拖动排序
    $scope.tabConfig = function (obj1, obj2, type) {
        return {
            animation: 150,
            draggable: ".ng-scope",
            filter: obj1,
            onUpdate: function (evt) {
                $scope.showTab(evt.newIndex, type);
                $(obj1).eq(0).insertAfter($(obj2)[0].childNodes[$(obj2)[0].childNodes.length - 1]);
            }
        }
    };
    iniChartScope($scope)
}


//初始化增加应用scope
function iniChartScope($scope) {
    $scope.chartTemplate = {
        series: [],
        xAxis: [{id: "date"}],
        theme: "grid-light"
    };
    $scope.chartIndex = 0;
    $scope.axisIndex = 0;
    $scope.chartSet = {
        cols: [],
        data: [],
        title: "未命名",
        xAxis: [],
        yAxis: [],
        tabs: []
    };
    $scope.showAxisTab = function (index) {
        $scope.axisIndex = index;
    };
    $scope.closeAxisTab = function (tab) {
        var i;
        $scope.chartSet.yAxis.forEach(function (item, index) {
            if (item.id == tab.id) {
                i = index;
                $scope.chartSet.yAxis.splice(index, 1)
            }
            $scope.chartSet.tabs.forEach(function (ctab) {
                if (ctab.yAxis == item.id)
                    ctab.yAxis = 0;
            })
        });
        $scope.showAxisTab(Math.max(0, i - 1));
    };
    $scope.addAxisTab = function () {
        if ($scope.chartSet.yAxis.length < 3) {
            var name = randomChar();
            $scope.chartSet.yAxis.push({
                id: name,
                field: name,
                title: {
                    text: '未命名',
                    style: {
                        color: '#89A54E'
                    }
                },
                lineWidth: 1,
                lineColor: '#89A54E',
                labels: {
                    style: {
                        color: '#89A54E'
                    }
                },
                opposite: true,
                unit: "",
                useHTML: true
            });
            $scope.showAxisTab(Math.max(0, $scope.chartSet.yAxis.length - 1));
        }
    }
}

