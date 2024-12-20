<script>
import { ref, onMounted, onUnmounted } from "vue";
import loader from "../components/googleMapsLoader";
import StoreType from "../components/HomePage/StoreType.vue"
import SearchInput from "../components/SearchInput.vue";

// Local Storage 工具方法
const localStorageUtil = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("places-updated"));
  },
  get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
};

export default {
  components: {
    StoreType,
    SearchInput
  },
  setup() {
    return {
      // 只保留必要的返回值
    };
  },
  data() {
    return {
      keyword: "", // 用戶輸入的關鍵字
      selectedDistrict: "大安區", // 預設行政區
      sortOrder: "default", // 預設排序方式
      districts: {
        "中正區": { lat: 25.032404, lng: 121.519033 },
        "大同區": { lat: 25.063093, lng: 121.513305 },
        "中山區": { lat: 25.0685, lng: 121.5266 },
        "松山區": { lat: 25.0585, lng: 121.5585 },
        "大安區": { lat: 25.033976, lng: 121.543459 },
        "萬華區": { lat: 25.0354, lng: 121.4997 },
        "信義區": { lat: 25.0306, lng: 121.5701 },
        "士林區": { lat: 25.0922, lng: 121.5245 },
        "北投區": { lat: 25.1321, lng: 121.4987 },
        "內湖區": { lat: 25.083, lng: 121.5868 },
        "南港區": { lat: 25.0553, lng: 121.6171 },
        "文山區": { lat: 24.9987, lng: 121.5549 },
      },
      places: [], // 搜尋結果
      searched: false, // 是否已搜尋
    };
  },
  methods: {
    async searchPlaces() {
      this.places = [];
      this.searched = false;
      console.log("test")

      if (!this.keyword.trim()) {
        alert("請輸入有效的關鍵字！");
        return;
      }

      const { lat, lng } = this.districts[this.selectedDistrict];

      // 使用 Google Maps Loader
      await loader.load();

      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 1000,
        keyword: this.keyword,
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.places = results.map((place) => ({
            ...place,
            distance: this.calculateDistance(
              lat,
              lng,
              place.geometry.location.lat(),
              place.geometry.location.lng()
            ),
            photo:
              place.photos && place.photos[0]
                ? place.photos[0].getUrl({ maxWidth: 400 })
                : null,
          }));

          // 儲存資料到 Local Storage
          localStorageUtil.set("places", this.places);
          localStorageUtil.set("sortOrder", this.sortOrder);
        } else {
          console.error("搜尋失敗，狀態：", status);
        }

        this.searched = true;
      });
    },
    calculateDistance(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = this.degToRad(lat2 - lat1);
      const dLng = this.degToRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.degToRad(lat1)) *
          Math.cos(this.degToRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    degToRad(deg) {
      return deg * (Math.PI / 180);
    },
  },
};
</script>




<template>
  <div>
    <!-- 搜尋區塊 -->
    <div class="relative flex flex-col items-center justify-center m-auto text-center bg-top bg-no-repeat bg-cover h-96 bg-index_searchBG"
         aria-label="Photo by Ivan Torres on Unsplash">
      <div class="absolute inset-0 bg-gray-800 opacity-40"></div>
      <h1 class="z-10 px-3 mt-8 text-3xl text-white md:text-5xl text-bold">想知道哪裡有美食？</h1>
      <h2 class="z-10 px-3 mt-5 text-lg text-white md:text-xl text-bold">從超過 50,000 家精選餐廳中，探索您不知道的熱門美食。</h2>
      <!-- 搜尋欄容器 -->
      <div class="z-10 hidden md:flex items-center mt-10 bg-white rounded-full h-11">
        <SearchInput />
      </div>
    </div>

    <!-- 餐廳分類按鈕 -->
    <StoreType />
  </div>
</template>

<style scoped>
/* 如果需要自定義一些額外樣式可以在這裡加入 */

@media (max-width: 768px) {
    header {
        flex-wrap: nowrap;
    }
    .hidden {
        display: none !important;
    }
    .main-menu {
        display: none; /* 小於等於 768px 隱藏主選單 */
    }
    .hamburger-menu {
        display: flex; /* 小於等於 768px 顯示漢堡選單 */
    }
}

@media (min-width: 769px) {
    .main-menu {
        display: flex; /* 大於等於 769px 顯示主選單 */
    }
    .hamburger-menu {
        display: none; /* 大於等於 769px 隱藏漢堡選單 */
    }
}
</style>