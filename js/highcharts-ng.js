'use strict';
angular.module('highcharts-ng', []).directive('highchart', ['chartLang', function (chartLang) {
    Highcharts.setOptions({
        lang: {
            contextButtonTitle: "图表导出菜单",
            decimalPoint: ".",
            downloadJPEG: "下载JPG图片",
            downloadPDF: "下载PDF文件",
            downloadPNG: "下载PNG图片",
            downloadSVG: "下载SVG文件",
            drillUpText: "返回 {series.name}",
            loading: "加载中",
            months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            noData: "没有数据",
            numericSymbols: ["千", "兆", "G", "T", "P", "E"],
            printChart: "打印图表",
            resetZoom: "恢复缩放",
            resetZoomTitle: "恢复图表",
            shortMonths: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
            thousandsSep: ",",
            weekdays: ["星期一", "星期二", "星期三", "星期三", "星期四", "星期五", "星期六", "星期天"],
            rangeSelectorFrom: "从",
            rangeSelectorZoom: "缩放",
            rangeSelectorTo: "到"
        }
    });
    var axisNames = [
        'xAxis',
        'yAxis'
    ];

    function prependMethod(obj, method, func) {
        var original = obj[method];
        obj[method] = function () {
            var args = Array.prototype.slice.call(arguments);
            func.apply(this, args);
            if (original) {
                return original.apply(this, args);
            } else {
                return;
            }
        };
    }


    return {
        restrict: 'EAC',
        replace: true,
        template: '<div></div>',
        scope: {config: '='},
        link: function (scope, element, attrs) {
            var chart = false;
            var isanimation = false;
            //监视图形类型
            scope.$watch('config.useHighStocks', function (useHighStocks, oldUseHighStocks) {
                if (useHighStocks === oldUseHighStocks) return;
                if (typeof(useHighStocks) != "undefined") {
                    initChart();
                }
            });
            //监视数据更新
            scope.$watch('config.series', function (newSeries, oldSeries) {
                if (chart && newSeries != oldSeries) {
                    if (newSeries == null) newSeries = [];
                    if (oldSeries == null) oldSeries = [];
                    //删除
                    if (newSeries.length < oldSeries.length) {
                        angular.forEach(oldSeries, function (oitem) {
                            if (!newSeries.some(function (nitem) {
                                    return (nitem.id == oitem.id);
                                })) {
                                if (chart.get(oitem.id))
                                    chart.get(oitem.id).remove();
                            }

                        });
                    }
                    //新增
                    else if (newSeries.length > oldSeries.length) {
                        angular.forEach(newSeries, function (nitem) {
                            if (!chart.get(nitem.id))
                                chart.addSeries(nitem, false);
                        })
                    }
                    //更新
                    else {
                        angular.forEach(newSeries, function (nitem) {
                            if (chart && chart.get(nitem.id))
                                chart.get(nitem.id).update(nitem);
                        })
                    }
                    chart.redraw();
                }
            }, true);

            scope.$watch('config.size', function (newSize, oldSize) {
                if (chart && isanimation) {
                    if (newSize && newSize.width && newSize.height) {
                        chart.setSize(newSize.width, newSize.height);
                    }
                    else if (oldSize) {
                        var wd = $(element[0]).width() - 2 + Math.round(Math.random());
                        chart.setSize(wd, wd / 2);
                    }
                    chart.redraw();
                }
            }, true);
//--------------------------------------------------------------------------------------------------------------
//配置环节，实时显示
            if (attrs.type != "view") {
                scope.$watch('config.yAxis', function (newSeries, oldSeries) {
                    xyAxis(newSeries, oldSeries, "yAxis");
                }, true);

                scope.$watch('config.xAxis', function (newSeries, oldSeries) {
                    xyAxis(newSeries, oldSeries, "xAxis");
                }, true);

                scope.$watch('config.title', function (newTitle) {
                    if (chart && newTitle)
                        chart.setTitle(newTitle, true);
                }, true);

                scope.$watch('config.subtitle', function (newSubtitle) {

                    if (chart && newSubtitle)
                        chart.setTitle(true, newSubtitle);
                }, true);

                scope.$watch('config.loading', function (loading) {
                    if (chart && loading) {
                        chart.showLoading();
                    }
                    else if (loading == false) {
                        chart.hideLoading();
                    }
                });

                scope.$on('highchartsng.reflow', function () {
                    chart.reflow();
                });

                scope.$on('$destroy', function () {
                    if (chart)
                        chart.destroy();
                    element.remove();
                });
            }
//--------------------------------------------------------------------------------------------------------------
//内部函数
            function initChart() {
                if (chart)
                    chart.destroy();
                var config = scope.config || {};
                var defaultConfigs = getdefaultConfigs(element, config);
                Highcharts.setOptions(Highcharts_theme[defaultConfigs.theme]);
                chart = config.useHighStocks ? new Highcharts.StockChart(defaultConfigs) : new Highcharts.Chart(defaultConfigs);
                if (config.loading) {
                    chart.showLoading();
                }

            }

            function xyAxis(newSeries, oldSeries, type) {
                if (chart && newSeries != oldSeries) {
                    if (newSeries == null) newSeries = [];
                    if (oldSeries == null) oldSeries = [];

                    //删除
                    if (newSeries.length < oldSeries.length) {
                        angular.forEach(oldSeries, function (oitem) {
                            if (!newSeries.some(function (nitem) {
                                    return (nitem.id == oitem.id);
                                })) {
                                chart.get(oitem.id).remove();
                            }
                        });
                    }
                    //新增
                    else if (newSeries.length > oldSeries.length) {
                        angular.forEach(newSeries, function (nitem) {
                            if (!chart.get(nitem.id))
                                chart.addAxis(nitem, type == "xAxis", true, true);
                        });
                    }
                    //更新
                    else {
                        angular.forEach(newSeries, function (nitem) {
                            if (chart.get(nitem.id))
                                chart.get(nitem.id).update(nitem);
                        })
                    }
                }
            }

            function getdefaultConfigs(element, config) {
                var defaultConfigs = {
                    chart: {reflow: true, renderTo: element[0], plotBackgroundImage: null},
                    credits: {text: "qutke.com", href: "//qutke.com", enabled: true},
                    legend: {enabled: true, align: "center"},
                    navigator: {enabled: true},
                    plotOptions: {
                        series: {
                            connectNulls: true,//忽略空值
                            turboThreshold: 0//曲线最大1000个{}点
                        }
                    },
                    theme: "grid-light"
                };
                angular.extend(defaultConfigs, config);
                return defaultConfigs;
            };


        }
    };
}]).factory('chartLang', function () {
    return {
        "themes": ["skies", "sand-signika", "grid", "grid-light", "gray", "dark-unica", "dark-green", "dark-blue"],
        "points": [{"val": "circle", "name": "圆圈"}, {"val": "square", "name": "方块"}, {
            "val": "diamond",
            "name": "菱形"
        }, {"val": "triangle", "name": "三角形"}, {"val": "triangle-down", "name": "倒三角"}]
        ,
        "lineTypes": [{"val": "line", "name": "直线图"}, {"val": "spline", "name": "曲线图"}, {
            "val": "area",
            "name": "面积图"
        }, {"val": "areaspline", "name": "曲线面积图"}, {"val": "column", "name": "柱状图"}, {
            "val": "bar",
            "name": "条形图"
        }, {"val": "pie", "name": "饼图"}, {"val": "scatter", "name": "散点图"}],
        "dashStyle": ["Solid", "ShortDash", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash", "LongDash", "DashDot", "LongDashDot", "LongDashDotDot"]
    };
});
