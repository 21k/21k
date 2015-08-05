var filters = angular.module("filters", []);
filters.filter("dateFormat", function () {
    return function (id) {
        if (id)
            return new Date(parseInt("0x" + id.substr(0, 8)).toString(10) * 1000).Format("yyyy年MM月dd日hh:mm");
    }
});

filters.filter("maxtime", function () {
    return function (records) {
        if (records)
            return new Date(
                Math.max.apply(null, records.map(function (item) {
                    return parseInt("0x" + item._id.substr(0, 8)).toString(10) * 1000
                }))
            ).Format("yyyy年MM月dd日hh:mm");

    }
});
filters.filter("codeFormat", function () {
    return function (code) {
        if (code)
            try {

                return JSON.stringify(JSON.parse(code), null, 5)
            }
            catch (e) {
                return code;
            }
    }
});
filters.filter("cut", function () {
    return function (description, len) {
        if (description)
            try {
                var more = (description.length > len) ? "……" : "";
                return description.slice(0, len) + more;
            }
            catch (e) {
                return description;
            }
    }
});
filters.filter("calcVal", function () {
    return calcVal2;
});

filters.filter("xrow", function () {
    return function (x) {
       return  escape(x.field)
    }
});