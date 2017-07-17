//获取应用实例  
var app = getApp()
Page({
    data: {
        countryAjaxData: [],  //货币name及code列表
        countryData: [],//币种name列表
        index0: 1,  //第1个picker选择器的默认选项
        index1: 0,  //第2个picker选择器的默认选项
        index2: 1,  //第3个picker选择器的默认选项
        codeIndex0: 'USD',//第1个picker选择器的默认货币code
        codeIndex1: 'CNY',//第2个picker选择器的默认货币code
        codeIndex2: 'USD',//第3个picker选择器的默认货币code
        inputNumber: '100',  //输入金额
        exportNumber: '100', //输出金额
        exchange: 1.0,//汇率
        huobiduiData: [],  //货币对的总数据
        timer:'',  //定时器全局变量
    },
    onLoad: function () {  //获取系统信息 
        var that = this;
        wx.request({ //请求币种数据
            url: 'https://op.juhe.cn/onebox/exchange/list?key=1eefa75089e4641342fd9e5eca242063',
            dataType: 'JSONP',
            success: function (res) {
                that.setData({
                    countryAjaxData: JSON.parse(res.data).result.list
                });
                var countryData = [];
                for (var i = 0; i < that.data.countryAjaxData.length; i++) {
                    countryData.push(that.data.countryAjaxData[i].name)
                }
                console.log(JSON.parse(res.data).result.list)
                that.setData({
                    countryData: countryData
                });
            }
        });
        that.requExchange();
        that.getNowPrice(that.data.codeIndex2);
    },
    picker0Change: function (e) {
        var that = this;
        that.setData({
            index0: e.detail.value,
            codeIndex0: that.data.countryAjaxData[e.detail.value].code
        })
        that.requExchange();
    },
    picker1Change: function (e) {
        var that = this;
        that.setData({
            index1: e.detail.value,
            codeIndex1: that.data.countryAjaxData[e.detail.value].code
        })
        that.requExchange();
    },
    picker2Change: function (e) {
        var that = this;
        that.setData({
            index2: e.detail.value,
            codeIndex2: that.data.countryAjaxData[e.detail.value].code
        })
        that.getNowPrice(that.data.codeIndex2)
    },
    bindKeyInput: function (e) {  //将输入的数字存入importMoney变量中
        var that = this;
        that.setData({
            inputNumber: e.detail.value,
            exportNumber: (e.detail.value * that.data.exchange).toFixed(2) //输出钱数=输入钱数*汇率
        });
    },
    bindKeyInput1: function (e) {  //将输入的数字存入importMoney变量中
        var that = this;
        that.setData({
            exportNumber: e.detail.value,
            inputNumber: (e.detail.value / that.data.exchange).toFixed(2) //输出钱数=输入钱数*汇率
        });
    },
    clear: function (e) {
        this.setData({
            inputNumber: null,
            exportNumber: null
        });
    },
    requExchange: function () {  //请求汇率函数
        var that = this;
        if (that.data.codeIndex0 == that.data.codeIndex1) { //当货币对一样时，聚合请求不到数据
            that.setData({
                exchange: 1,
                exportNumber: (that.data.inputNumber * 1).toFixed(2) //更新输出钱数
            });
        } else {
            wx.request({
                url: 'https://op.juhe.cn/onebox/exchange/currency',
                data: {
                    key: '1eefa75089e4641342fd9e5eca242063',
                    from: that.data.codeIndex0,
                    to: that.data.codeIndex1
                },
                dataType: 'JSONP',
                success: function (res) {
                    that.setData({
                        exchange: JSON.parse(res.data).result[0].exchange,
                        exportNumber: (that.data.inputNumber * JSON.parse(res.data).result[0].exchange).toFixed(2) //更新输出钱数
                    });
                }
            });
        }
    },
    getNowPrice: function (country) {
        var that = this;
        wx.showLoading({
            title: '货币对加载中',
        })
        if (that.data.timer){
            clearInterval(that.data.timer);
            that.data.timer = null;
        }
        var quest = function () {
            wx.request({
                url: 'https://test.hytips.com/wechat/xgl_ajax.php',
                data: {
                    cfrom: country,
                },
                dataType: 'JSONP',
                success: function (res) {
                    wx.hideLoading();
                    var getData = JSON.parse(res.data);
                    for (var i = 0; i < getData.length; i++) {
                        getData[i].waihuichanpin_time = ((new Date().getMonth() + 1) + '-' + new Date().getDate()) + ' ' + getData[i].waihuichanpin_time.substring(0, 5)
                    }
                    that.setData({
                        huobiduiData: getData
                    });
                    /*var getData = JSON.parse(res.data).result[0]
                    var finalData = [];
                    for (var i = 0; i < Object.getOwnPropertyNames(getData).length; i++) {
                        var num = 'data' + (i + 1)
                        finalData.push(getData[num]);
                    }
                    for (var j = 0; j < finalData.length; j++) {
                        finalData[j].date = finalData[j].date.substring(5)
                        finalData[j].datatime = finalData[j].datatime.substring(0, 5)
                    }
                    that.setData({
                        huobiduiData: finalData
                    });*/
                }
            });
        }
        quest();
        that.setData({
            timer: setInterval(quest, 5000)
        });
    }
})


