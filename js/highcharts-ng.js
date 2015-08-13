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

    var updateZoom = function (axis, modelAxis) {
        var extremes = axis.getExtremes();
        if (modelAxis.currentMin !== extremes.dataMin || modelAxis.currentMax !== extremes.dataMax) {
            axis.setExtremes(modelAxis.currentMin, modelAxis.currentMax, false);
        }
    };
    var processExtremes = function (chart, axis, axisName) {
        if (axis.currentMin || axis.currentMax) {
            chart[axisName][0].setExtremes(axis.currentMin, axis.currentMax, true);
        }
    };

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
                                ////删除对应的navigator
                                //angular.forEach(chart.series, function (serie) {
                                //    if(oitem.field==serie.userOptions.field)
                                //        chart.get(serie.userOptions.id).remove();
                                //});
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
                        //更新并过滤导航条点标记
                        //if (chart.get("__navigator"))
                        //    chart.get("__navigator").setData(newSeries[0].data.map(function (item) {
                        //        if (typeof(item) == "object") return {
                        //            x: item.x,
                        //            y: item.y,
                        //            marker: {enabled: false},
                        //            dataLabels: {enabled: false}
                        //        };
                        //        return item;
                        //    }), false);
                        // chart.get("__navigator").setExtremes();
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
                        var wd = angular.element("body").width() - 2;
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
                    if (newTitle)
                        chart.setTitle(newTitle, true);
                }, true);

                scope.$watch('config.compare', function (ncompare) {
                    angular.forEach(chart.yAxis, function (item) {
                        chart.get(item.id).setCompare(ncompare);
                    });
                }, true);

                scope.$watch('config.subtitle', function (newSubtitle) {
                    if (newSubtitle)
                        chart.setTitle(true, newSubtitle);
                }, true);

                scope.$watch('config.loading', function (loading) {
                    if (loading) {
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
                var defaultConfigs = getdefaultConfigs(scope, element, config);
                if (defaultConfigs.theme)
                    Highcharts.setOptions(Highcharts_theme[defaultConfigs.theme]);
                chart = config.useHighStocks ? new Highcharts.StockChart(defaultConfigs) : new Highcharts.Chart(defaultConfigs);
                for (var i = 0; i < axisNames.length; i++) {
                    if (config[axisNames[i]]) {
                        processExtremes(chart, config[axisNames[i]], axisNames[i]);
                    }
                }
                if (config.loading) {
                    chart.showLoading();
                }
            }

            function xyAxis(newSeries, oldSeries, type) {
                if (newSeries != oldSeries) {
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

            function getdefaultConfigs(scope, element, config) {
                var defaultConfigs = {
                    chart: {reflow: true, renderTo: element[0], plotBackgroundImage: null},
                    credits: {text: "qutke.com", href: "//qutke.com", enabled: true},
                    legend: {enabled: true, align: "center"},
                    navigator: {enabled: true},
                    plotOptions: {
                        series: {
                            connectNulls: true,//忽略空值
                            turboThreshold: 0,//突破曲线最大1000个{}点
                            events: {
                                afterAnimate: function () {
                                    if (chart && config.size && config.size.width && config.size.height) {
                                        if (!isanimation) {
                                            setTimeout(function () {
                                                chart.setSize(config.size.width, config.size.height);
                                                isanimation = true;
                                            }, 10)
                                        }
                                    }
                                },
                                legendItemClick: function (e) {
                                    config.template.forEach(function (item) {
                                        if (item.id == e.currentTarget.userOptions.id) {
                                            item.visible = !e.currentTarget.visible;
                                        }
                                    });
                                }
                            },
                            tooltip: {},
                            dataGrouping: {
                                dateTimeLabelFormats: {
                                    millisecond: ['%Y-%m-%d %H:%M:%S', '%Y年%m月%d日 %H:%M:%S.%L', '-%H:%M:%S.%L'],
                                    second: ['%Y-%m-%d %H:%M:%S', '%Y年%m月%d日 %H:%M:%S', '-%H:%M:%S'],
                                    minute: ['%Y-%m-%d %H:%M:%S', '%Y年%m月%d日 %H:%M', '-%H:%M'],
                                    hour: ['%Y-%m-%d %H:%M', '%Y年%m月%d日 %H:%M', '-%H:%M'],
                                    day: ['%Y-%m-%d %H:%M', '%Y年%m月%d日 %H:%M', '-%H:%M'],
                                    week: ['%Y-%m-%d', '%A, %b %e', '-%A, %b %e, %Y'],
                                    month: ['%Y-%m-%d', '%B', '-%B %Y'],
                                    year: ['%Y', '%Y', '-%Y']
                                }
                            }
                        }
                    },
                    tooltip: {
                        xDateFormat: "%Y-%m-%d %H:%M:%S",
                        valueDecimals: 3
                    }
                };
                angular.extend(defaultConfigs, config);
                if (config.compare) defaultConfigs.plotOptions.series.compare = config.compare;
                defaultConfigs.plotOptions.series.tooltip.pointFormat = "<span style=\"color:{series.color}\">{series.name}</span>：<span style=\"color:{series.color}\">{point.y}</span><span style=\"color:{series.color};display:" + (config.compare ? "block" : "none") + "\"> ({point.change}%)</span><br/>";

                angular.forEach(axisNames, function (axisName) {
                    if (angular.isDefined(config[axisName])) {
                        defaultConfigs[axisName] = angular.copy(config[axisName]);
                        if (angular.isDefined(config[axisName].currentMin) || angular.isDefined(config[axisName].currentMax)) {
                            prependMethod(defaultConfigs.chart.events, 'selection', function (e) {
                                var thisChart = this;
                                if (e[axisName]) {
                                    scope.$apply(function () {
                                        config[axisName].currentMin = e[axisName][0].min;
                                        config[axisName].currentMax = e[axisName][0].max;
                                    });
                                } else {
                                    scope.$apply(function () {
                                        config[axisName].currentMin = thisChart[axisName][0].dataMin;
                                        config[axisName].currentMax = thisChart[axisName][0].dataMax;
                                    });
                                }
                            });
                            prependMethod(defaultConfigs.chart.events, 'addSeries', function (e) {
                                config[axisName].currentMin = this[axisName][0].min || config[axisName].currentMin;
                                config[axisName].currentMax = this[axisName][0].max || config[axisName].currentMax;
                            });
                        }
                    }
                });
                return defaultConfigs;
            }


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
        "dashStyle": ["Solid", "ShortDash", "ShortDot", "ShortDashDot", "ShortDashDotDot", "Dot", "Dash", "LongDash", "DashDot", "LongDashDot", "LongDashDotDot"],
        "colors": ["#ed808c", "#1cb1c7", "#43733e", "#f7905c", "#a04c4e", "#b486af", "#6bcbb8", "#d6b29a", "#164d88", "#7e8242", "#90c6d9", "#888689"],
        "compare": [{name: "不比较", val: null}, {name: "数值比较", val: "value"}, {name: "百分数比较", val: "percent"}]
    };
});
