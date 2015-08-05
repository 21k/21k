Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


//返回定长随机字符串
function randomChar(num) {
    var chars = "abcdefghijklmnopqrstuvwxyz";
    num = num || 6;
    for (var result = []; result.length < num;) {
        var tmp = chars[Math.round(Math.random() * (chars.length - 1))];
        result.push(Math.random() > 0.5 ? tmp : tmp.toUpperCase());
    }
    return "__" + result.join("");
}

// 计算函数
function calcVal2(rule, row) {
    {
        var mathMethod = "abs,acos,asin,atan,atan2,ceil,cos,exp,floor,log,max,min,pow,round,sin,sqrt,random,tan,E,PI".split(",");
        var ok = true;
        if (typeof(rule) != "undefined") {
            var result = rule.replace(/[a-zA-Z_0-9]+/g, function (a) {
                if (typeof(row[a]) != "undefined") a = "(" + row[a] + ")";
                else if (mathMethod.indexOf(a) > -1) a = "Math." + a;
                else if (!/^\d+$/.test(a)) ok = false;
                return a;
            });
            if (ok) {
                try {
                    rule = eval(result).toFixed(2)
                }
                catch (e) {
                }
            }
            return rule;
        }
    }
}
//返回范围
function range(max, val, min, step) {
    step = step || 1;
    min = min || 0;
    var input = [];

    for (var i = min; i < max; i += step) {
        if (val != "INC") input.push(val);
        else input.push(i);
    }
    return input;
}

//返回指定个数随机数组
function rangeRnd(val, num, type) {
    var data;
    num = num || 20;
    type = type || 1;
    if (typeof(val) == "object" && val.length == 2) {
        var min = val[0];
        var max = val[1];
    }
    else
        data = val;
    for (var input = []; input.length < num;)
        if (type == 1)
            input.push(data || parseFloat((Math.random() * (max - min) + min).toFixed(2)));
        else  input.push({
            x: timeSeries(input.length),
            y: data || parseFloat((Math.random() * (max - min) + min).toFixed(2))
        });
    return input;
}

//时间序列生成
function timeSeries(n) {
    var t = 1438704565069;
    return new Date(t + n * 1000).getTime();
}
/**
 * JSON列转行
 */
function col2row(data, ccol, dcol) {
    ccol = ccol || 'field';
    dcol = dcol || 'data';
    if (data.length) {
        var rowLen = data[0][dcol].length;
        var rows = [];
        for (var i = 0; i < rowLen; i++) {
            var row = {}
            for (var j = 0; j < data.length; j++) {
                row[data[j][ccol]] = data[j][dcol][i];
            }
            rows.push(row);
        }
        return rows;
    }
    else return [];
}
