var setdata = {
    "dataSet": [
        {
            "name": "数据类型",
            "data": [
                "实时数据",
                "日间数据",
                "行情数据"
            ],
            "key": "dt"
        },
        {
            "name": "存储类型",
            "data": [
                "MYSQL",
                "REDIS",
                "MONGODB",
                "S3"
            ],
            "key": "st"
        },
        {
            "name": "投资领域",
            "data": [
                "股票",
                "债券",
                "基金",
                "期货",
                "期权",
                "外汇",
                "宏观",
                "行业"
            ],
            "key": "iv"
        }
    ],
    "dataStatus": {
        "name": "数据类型",
        "data": [
            "已上线",
            "已下线",
            "未上线"
        ],
        "key": "ds"
    },
    "freq": {
        "name": "更新频率",
        "data": [
            {label: "实时更新", reg: "", holder: "样例： hh:mm:ss-hh:mm:ss,hh:mm:ss-hh:mm:ss"},
            {label: "每日更新", reg: "", holder: "样例： hh:mm:ss,hh:mm:ss"},
            {label: "单次更新", reg: "", holder: "样例： YYYY-MM-dd hh:mm:ss"}
        ],
        "key": "fr"
    }
}