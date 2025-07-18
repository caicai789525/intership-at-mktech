<template>
  <div class="weather-search">
    <div class="search-container">
      <input
          v-model="city"
          type="text"
          placeholder="输入城市名称"
          @keyup.enter="fetchCoordinates"
          class="search-input"
      />
      <button @click="fetchCoordinates" class="search-button">搜索</button>
    </div>

    <!-- 展示天气信息 -->
    <div v-if="weatherData" class="weather-card">
      <div class="temp-condition">
        <h1 class="temperature">{{ weatherData.main.temp }}°C</h1>
        <!-- 使用方法获取本地图标路径 -->
        <img :src="getLocalIcon(weatherData.weather[0].id, weatherData.dt, weatherData.sys.sunrise, weatherData.sys.sunset)" alt="天气图标" class="weather-icon">
      </div>
      <div class="location-condition">
        <h2 class="location">{{ fetchedCityName }}, {{ weatherData.sys.country }}</h2>
        <h2 class="condition">{{ weatherData.weather[0].main }} - {{ weatherData.weather[0].description }}</h2>
      </div>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>
<script>
import axios from 'axios';

import {
  API_KEY,
  GEO_API_URL,
  WEATHER_API_URL
} from '../../config/apiconfig';

export default {
  name: 'WeatherSearch',
  data() {
    return {
      city: '',
      weatherData: null,
      error: null,
      apiKey: API_KEY,
      fetchedCityName: ''
    };
  },
  methods: {
    async fetchCoordinates() {
      this.error = null;
      this.weatherData = null;
      if (!this.city.trim()) {
        this.error = '请输入有效的城市名称';
        return;
      }
      try {
        const response = await axios.get(
            `${GEO_API_URL}?q=${this.city}&appid=${this.apiKey}&limit=1&lang=zh_cn`
        );
        if (response.data.length === 0) {
          this.error = '未找到该城市，请检查输入';
          return;
        }
        const geoData = response.data[0];
        const { lat, lon } = geoData;
        if (geoData.local_names && geoData.local_names.zh) {
          this.fetchedCityName = geoData.local_names.zh;
        } else {
          this.fetchedCityName = geoData.name;
        }
        await this.fetchWeather(lat, lon);
      } catch (error) {
        if (error.response) {
          this.error = `请求失败，状态码: ${error.response.status}，错误信息: ${error.response.data.error.message}`;
        } else if (error.request) {
          this.error = '没有收到服务器响应，请检查网络连接';
        } else {
          this.error = '请求配置出错: ' + error.message;
        }
      }
    },
    async fetchWeather(lat, lon) {
      try {
        const response = await axios.get(
            `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=zh_cn`
        );
        this.weatherData = response.data;
      } catch (error) {
        if (error.response) {
          this.error = `请求失败，状态码: ${error.response.status}，错误信息: ${error.response.data.error.message}`;
        } else if (error.request) {
          this.error = '没有收到服务器响应，请检查网络连接';
        } else {
          this.error = '请求配置出错: ' + error.message;
        }
      }
    },
    getLocalIcon(weatherId, currentTime, sunrise, sunset) {
      const isDay = currentTime >= sunrise && currentTime <= sunset;
      let iconName;

      switch (true) {
          // 晴天
        case weatherId === 800:
          iconName = isDay ? '0.png' : '1.png';
          break;
          // 少云
        case weatherId === 801:
          iconName = isDay ? '2.png' : '3.png';
          break;
          // 疏云、多云、阴天
        case weatherId >= 802 && weatherId <= 804:
          iconName = isDay ? '4.png' : '9.png';
          break;
          // 轻度阵雨
        case weatherId === 520:
          iconName = isDay ? '5.png' : '6.png';
          break;
          // 阵雨相关
        case weatherId >= 521 && weatherId <= 531:
          iconName = '11.png';
          break;
          // 小雨
        case weatherId === 500:
          iconName = '10.png';
          break;
          // 中雨
        case weatherId === 501:
          iconName = '14.png';
          break;
          // 大雨、暴雨、特大暴雨
        case weatherId >= 502 && weatherId <= 504:
          iconName = '15.png';
          break;
          // 冻雨
        case weatherId === 511:
          iconName = '12.png';
          break;
          // 雷暴相关
        case weatherId >= 200 && weatherId < 300:
          iconName = '16.png';
          break;
          // 毛毛雨相关
        case weatherId >= 300 && weatherId < 400:
          iconName = '10.png';
          break;
          // 小雪
        case weatherId === 600:
          iconName = '21.png';
          break;
          // 雪
        case weatherId === 601:
          iconName = '24.png';
          break;
          // 大雪
        case weatherId === 602:
          iconName = '25.png';
          break;
          // 雨夹雪相关
        case weatherId >= 611 && weatherId <= 616:
          iconName = '12.png';
          break;
          // 阵雪相关
        case weatherId >= 620 && weatherId <= 622:
          iconName = '21.png';
          break;
          // 沙尘卷、沙尘
        case weatherId === 731 || weatherId === 751:
          iconName = '26.png';
          break;
          // 薄雾、霾、雾
        case weatherId === 701 || weatherId === 721 || weatherId === 741:
          iconName = '30.png';
          break;
          // 烟、尘土、火山灰
        case weatherId === 711 || weatherId === 761 || weatherId === 762:
          iconName = '31.png';
          break;
          // 飑、龙卷风
        case weatherId === 771 || weatherId === 781:
          iconName = '32.png';
          break;
          // 默认情况
        default:
          iconName = isDay ? '0.png' : '1.png';
      }

      return require(`@/assets/图标/${iconName}`);
    }
  }
};
</script>

<style scoped>
.weather-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
}

.search-input {
  padding: 12px 16px;
  font-size: 18px;
  border: none;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 300px;
  transition: box-shadow 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.search-button {
  padding: 12px 24px;
  background-color: #ff6b6b;
  font-size: 18px;
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.search-button:hover {
  background-color: #e84343;
  transform: translateY(-1px);
}

.weather-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease;
  text-align: center;
}

.temp-condition {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.temperature {
  font-size: 48px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.weather-icon {
  width: 100px;
  height: 100px;
}

.location-condition {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.location {
  font-size: 24px;
  color: #555;
  margin: 0;
}

.condition {
  font-size: 18px;
  color: #777;
  margin: 0;
}

.error-message {
  color: #ff4757;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px 30px;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>