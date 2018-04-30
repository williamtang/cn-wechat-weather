const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

Page({
  data: {
    nowTemp: 12,
    nowWeather: '多云',
    nowWeatherBackground: "",
    hourlyWeather: [],
    todayTemp: "",
    todayDate: "",
    city: "广州市",
    locationTipsText: "点击获取当前位置"
  }, 
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'PH5BZ-52SR6-JDKSW-ERBUF-NWBYO-I3F7Y'
    })
    this.getNow()
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', //仅为示例，并非真实的接口地址
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result

        this.setNow(result)

        // set forecast
        this.setHourlyWeather(result)

        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      },
    })
  },

  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)

    this.setData({
      nowTemp: temp,
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })

    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyWeather(result) {
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },
  onTapLocation() {
    wx.getLocation({
      success: res => {
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            console.log(city)
            this.setData({
              city:  city,
              locationTipsText: ""
            })
            this.getNow()
          }
        })
      },
    })
  }
})