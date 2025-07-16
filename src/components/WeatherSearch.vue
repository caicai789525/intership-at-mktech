<template>
  <div class="weather-search">
    <div class="search">
      <input
          v-model="city"
          type="text"
          placeholder="输入城市名称"
          @keyup.enter="fetchCoordinates"
      />
      <button @click="fetchCoordinates">搜索</button>
    </div>

    <!-- 展示天气信息 -->
    <div v-if="weatherData" class="weather-info">
      <div class="temp-condition">
        <h1 class="temprature">温度: {{ weatherData.main.temp }}°C</h1>
        <img :src="'https://openweathermap.org/img/wn/' + weatherData.weather[0].icon + '@2x.png'" alt="天气图标">
      </div>
      <div class="location-condition">
        <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>
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
}from '../../config/apiconfig';

export default {
  name: 'WeatherSearch',
  data() {
    return {
      city: '',
      weatherData: null,
      error: null,
      apiKey: API_KEY,
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
            `${GEO_API_URL}?q=${this.city}&appid=${this.apiKey}&limit=1`
        );
        if (response.data.length === 0) {
          this.error = '未找到该城市，请检查输入';
          return;
        }
        const {lat, lon} = response.data[0];
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
    }
  }
};
</script>

<style scoped>
.weather-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  justify-content: center;
  background: linear-gradient(to bottom right, #ffffff, #3d75e5);
  min-height: 100vh;
  width: 100vw;
  border: none;
  outline: none;
  box-sizing: border-box;
}
input {
  padding: 8px;
  border-radius: 5px;
  margin-right: 10px;
  margin-bottom: 10px;
}
button {
  padding: 8px 16px;
  background-color: #42b983;
  border-radius: 5px;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #35495e;
}
search {
  margin-top: 20px;
  padding: 20px;
  border: none;
  outline: none;
  border-radius: 5px;
  display: inline-block;
}
.weather-info {
  margin-top: 20px;
  padding: 20px;
  border: none;
  outline: none;
  border-radius: 5px;
  display: inline-block;
}
.error-message {
  color: red;
  margin-top: 10px;
}
.location-condition {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}
.temp-condition {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}
.condition {
  margin: 0;
}
.temprature {
  marign: 0;
}
</style>