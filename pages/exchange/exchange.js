// exchange.js
Page({
    data: {
        bankAjaxData: [],  //银行name及code列表
        bankData: [],//银行name列表
        baseData: [],  //详情数据
        index0: 3,  //第1个picker选择器的默认选项
    },
    onLoad: function () {
        var that = this;
        that.setData({
            bankAjaxData: [{ num: 0, name: '工商银行' }, { num: 1, name: '招商银行' }, { num: 2, name: '建设银行' }, { num: 3, name: '中国银行' }, { num: 4, name: '交通银行' }, { num: 5, name: '农业银行' }],
            bankData: ['工商银行', '招商银行', '建设银行', '中国银行', '交通银行', '农业银行']
        });
        that.getBankData(that.data.index0);
    },
    picker0Change: function (e) {
        var that = this;
        that.setData({
            index0: e.detail.value,
        })
        that.getBankData(e.detail.value);
    },
    getBankData: function (bankNum) {  //请求详细数据
        var that = this;
        wx.showLoading({
            title: '数据加载中',
        })
        wx.request({ //请求数据
            url: 'https://test.hytips.com/wechat/paijia_ajax.php',
            data: { bank: bankNum },
            dataType: 'JSONP',
            success: function (res) {
                wx.hideLoading()
                var getData = JSON.parse(res.data).result
                var finalData = [];
                for (var i = 0; i < Object.getOwnPropertyNames(getData[0]).length; i++) {
                    var num = 'data' + (i + 1)
                    finalData.push(getData[0][num]);
                }
                for (var j = 0; j < finalData.length; j++) {
                    finalData[j].time = finalData[j].time.substring(0, 5)
                }
                that.setData({
                    baseData: finalData
                });
            }
        });
    },
    navTo: function (e) {  //页面跳转
        wx.navigateTo({
          url: '../paring/paring?name=' + this.data.baseData[e.target.id].name
        })
    }
})