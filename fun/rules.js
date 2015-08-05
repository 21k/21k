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
    },
    auth:[
        {v:"open",l:"完全可见"},
        {v:"auth",l:"登录可见"},
        {v:"private",l:"授权可见"}
    ],
   userlist:[{
        userid: '55948ffc74930c714d8e8a5b',
        username: 'WeilinLin',
        role: 'admin'
    }, {
        userid: '5593c4aa74930c714d8e8a59',
        username: 'random',
        role: 'admin'
    },
        {
            userid: '5593d87c74930c714d8e8a5a',
            username: 'bsspirit',
            role: 'admin'
        },
        {
            userid: '559b10ae9acf889e15656fb7',
            username: 'zhangfy',
            role: 'admin'
        },
        {
            userid: '559de31a129177eb56977a4f',
            username: 'chenht',
            role: 'admin'
        },
        {
            userid: '55a336cddbe434674e8d2b83',
            username: 'shanglw',
            role: 'admin'
        },
        {
            userid: '55a5df8bdbe434674e8d2bcf',
            username: 'migrant',
            role: 'admin'
        },
        {
            userid: '559f63d4dbe434674e8d2b5e',
            username: 'lizhe',
            role: 'admin'
        },
        {
            userid: '559fc4f8dbe434674e8d2b71',
            username: 'quant',
            role: 'admin'
        },
        {
            userid: '55b1d0aa771f0b3501df80a4',
            username: 'lixx111',
            role: 'admin'
        }
        ,
        {
            userid: '5593b4c34b0dde9742e9af34',
            username: 'zhongyu',
            role: 'admin'
        }
        ,
        {
            userid: '55b71e18771f0b3501df80a9',
            username: 'liujj',
            role: 'admin'
        }]
}