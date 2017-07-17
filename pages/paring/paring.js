// pages/paring/paring.js

Page({
    data: {
        currentTab: 0, // tab切换  
        urlName: '',  //从牌价页面传过来的参数
        processData: [['工商银行'], ['招商银行'], ['建设银行'], ['中国银行'], ['交通银行'], ['农业银行']],  //6个银行一次性加载的数据
        tempData: [],  //保存完整的数据，便于切换页面时重新加载数据
        tempPercent: [[], [], [], []],//每获取一个数据以[[[0,434.56],[1,434.56]...],[],[],[]]的形式存入对象中,便于计算百分比
        cardNum: 0,//默认第一个选项卡为0
    },

    onLoad: function (options) {
        var that = this;
        that.setData({
            urlName: options.name,
        })
        wx.showLoading({
            title: '数据加载中',
        })
        that.getBankData(6);
    },
    bindChange: function (e) {
        var that = this;
        that.setData({
            processData: [],//切换页面时重新加载数据
        });
        that.setData({
            currentTab: e.detail.current,
            cardNum: e.detail.current,
            processData: that.data.tempData
        });
    },
    swichNav: function (e) {
        var that = this;
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
            that.setData({
                processData: [],//切换页面时重新加载数据
            });
            that.setData({
                currentTab: e.target.dataset.current,
                cardNum: e.target.dataset.current,
                processData: that.data.tempData
            })
        }
    },
    getBankData: function (Num) {  //请求6个银行的详细数据
        var that = this;
        for (var k = 0; k < Num; k++) {
            (function (x) {
                wx.request({ //请求数据
                    url: 'https://test.hytips.com/wechat/paijia_ajax.php',
                    data: { bank: x },
                    dataType: 'JSONP',
                    success: function (res) {
                        wx.hideLoading();
                        var getData = JSON.parse(res.data).result
                        var finalData = [];
                        for (var i = 0; i < Object.getOwnPropertyNames(getData[0]).length; i++) {
                            var num = 'data' + (i + 1)
                            finalData.push(getData[0][num]);
                        }
                        for (var j = 0; j < finalData.length; j++) {
                            finalData[j].time = finalData[j].time.substring(0, 5)
                        }
                        for (var nameNum = 0; nameNum < finalData.length; nameNum++) {
                            if (finalData[nameNum].name == that.data.urlName) {
                                var urlId = nameNum;
                            }
                        }
                        var processData0 = that.data.processData;  //[['工商银行','时间','买钞价'...], ['招商银行'],...]
                        processData0[x][1] = finalData[urlId].time  //时间
                        processData0[x][2] = finalData[urlId].mBuyPri  //买钞价
                        processData0[x][3] = finalData[urlId].fBuyPri  //买汇价
                        processData0[x][4] = finalData[urlId].mSellPri  //卖钞价
                        processData0[x][5] = finalData[urlId].fSellPri  //卖汇价

                        var tempPercent0 = that.data.tempPercent;  //一个三维数组
                        //[[0,434.56(买钞价)],[1,434.56(买钞价)],[2,434.56]...]
                        //[[0,434.56(买汇价)],[1,434.56(买汇价)],[2,434.56]...]
                        //[[0,434.56(卖钞价)],[1,434.56(卖钞价)],[2,434.56]...]
                        //[[0,434.56(卖汇价)],[1,434.56(卖汇价)],[2,434.56]...]
                        tempPercent0[0].push([x, finalData[urlId].mBuyPri])
                        tempPercent0[1].push([x, finalData[urlId].fBuyPri])
                        tempPercent0[2].push([x, finalData[urlId].mSellPri])
                        tempPercent0[3].push([x, finalData[urlId].fSellPri])
                        that.setData({
                            processData: processData0,
                            tempPercent: tempPercent0
                        })
                        function getPercent(num) {  //计算百分比数据：num表示tempPercent的第几个数组
                            var getMax = function (num) {
                                var max = that.data.tempPercent[num][0][1];
                                var min = that.data.tempPercent[num][0][1];
                                for (var l = 0; l < that.data.tempPercent[num].length; l++) {
                                    if (max < that.data.tempPercent[num][l][1]) {
                                        max = that.data.tempPercent[num][l][1]
                                    }
                                    if (min > that.data.tempPercent[num][l][1]) {
                                        min = that.data.tempPercent[num][l][1]
                                    }
                                }
                                return [max, min];
                            }
                            for (var m = 0; m < that.data.tempPercent[num].length; m++) {
                                var tempIndex = that.data.tempPercent[num][m][0];
                                var tempNumer = that.data.tempPercent[num][m][1];
                                var fenmu = (getMax(num)[0] - getMax(num)[1]);
                                if (fenmu == 0) {
                                    fenmu = 100000;
                                }
                                var percent = 90 - (50 * (getMax(num)[0] - tempNumer) / fenmu)
                                processData0[tempIndex][(6 + num)] = percent  //买钞所占百分比
                            }
                            that.setData({
                                processData: processData0,
                                tempData: processData0,
                            })
                        }
                        getPercent(0);
                        getPercent(1);
                        getPercent(2);
                        getPercent(3);
                    }
                });
            })(k)
        }
    },
})