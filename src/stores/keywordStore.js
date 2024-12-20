// store.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { reactive ,ref} from 'vue'
 
 
export const useKeywordStore = defineStore('keyword', {
  state: () => ({
    keyword: "", //關鍵字
    sortOrder:"default", //排序
    sortOptions:{
      default: "預設",
      distance: "最近距離",
      rating: "最高評分",
      reviews: "最高人氣"
    },
    selectedDistrict: "中正區", //當前選擇地區 
    coordinate: { lat: 25.032404, lng: 121.519033 },//當前地區座標
    districts: ref({ //地區選項
        "我的位置": null,
        "台北市": {
    "中正區": { lat: 25.032404, lng: 121.519033 },
    "大同區": { lat: 25.063093, lng: 121.513085 },
    "中山區": { lat: 25.0685, lng: 121.5266 },
    "松山區": { lat: 25.0585, lng: 121.5588 },
    "大安區": { lat: 25.03976, lng: 121.543459 },
    "萬華區": { lat: 25.0354, lng: 121.4997 },
    "信義區": { lat: 25.0306, lng: 121.5701 },
    "士林區": { lat: 25.0922, lng: 121.5245 },
    "北投區": { lat: 25.1321, lng: 121.4987 },
    "內湖區": { lat: 25.083, lng: 121.5868 },
    "南港區": { lat: 25.0553, lng: 121.6171 },
    "文山區": { lat: 24.9987, lng: 121.5549 }
  },
        "新北市": {
    "板橋區": { lat: 25.011, lng: 121.458 },
    "三重區": { lat: 25.072, lng: 121.486 },
    "中和區": { lat: 24.993, lng: 121.499 },
    "永和區": { lat: 25.008, lng: 121.514 },
    "新莊區": { lat: 25.036, lng: 121.432 },
    "新店區": { lat: 24.971, lng: 121.537 },
    "樹林區": { lat: 24.984, lng: 121.418 },
    "鶯歌區": { lat: 24.953, lng: 121.353 },
    "三峽區": { lat: 24.934, lng: 121.369 },
    "淡水區": { lat: 25.164, lng: 121.448 },
    "瑞芳區": { lat: 25.107, lng: 121.828 },
    "土城區": { lat: 24.973, lng: 121.451 },
    "蘆洲區": { lat: 25.085, lng: 121.473 },
    "五股區": { lat: 25.082, lng: 121.426 },
    "泰山區": { lat: 25.060, lng: 121.432 },
    "林口區": { lat: 25.077, lng: 121.396 },
    "深坑區": { lat: 25.002, lng: 121.615 },
    "石碇區": { lat: 24.991, lng: 121.631 },
    "坪林區": { lat: 24.937, lng: 121.701 },
    "三芝區": { lat: 25.258, lng: 121.510 },
    "石門區": { lat: 25.290, lng: 121.563 },
    "八里區": { lat: 25.151, lng: 121.398 },
    "平溪區": { lat: 25.025, lng: 121.738 },
    "雙溪區": { lat: 24.998, lng: 121.829 },
    "貢寮區": { lat: 25.016, lng: 121.917 },
    "金山區": { lat: 25.223, lng: 121.636 },
    "萬里區": { lat: 25.175, lng: 121.689 },
    "烏來區": { lat: 24.789, lng: 121.551 }
  },
        "桃園市": { lat: 24.965, lng: 121.224 },
        "台中市": { lat: 24.198, lng: 120.630 },
        "台南市": { lat: 22.994, lng: 120.202 },
        "高雄市": { lat: 22.631, lng: 120.302 },
        "基隆市": { lat: 25.125, lng: 121.741 },
        "新竹市": { lat: 24.804, lng: 120.971 },
        "嘉義市": { lat: 23.479, lng: 120.437 },
        "新竹縣": { lat: 24.839, lng: 121.004 },
        "苗栗縣": { lat: 24.564, lng: 120.818 },
        "彰化縣": { lat: 24.081, lng: 120.538 },
        "南投縣": { lat: 23.913, lng: 120.685 },
        "雲林縣": { lat: 23.707, lng: 120.543 },
        "嘉義縣": { lat: 23.459, lng: 120.346 },
        "屏東縣": { lat: 22.673, lng: 120.488 },
        "宜蘭縣": { lat: 24.678, lng: 121.769 },
        "花蓮縣": { lat: 23.976, lng: 121.604 },
        "台東縣": { lat: 22.758, lng: 121.144 },
        "澎湖縣": { lat: 23.565, lng: 119.563 },
        "金門縣": { lat: 24.436, lng: 118.317 },
        "連江縣": { lat: 26.159, lng: 119.951 }
    }),
    selectedCost:"default",
    costOptions: {
      default: "全部",
      cost1: "200內",
      cost2: "201~400",
      cost3: "401~600",
      cost4:"601~800",
      cost5: "801~1000",
      cost6: "1000以上",
    },
   isOpen: false,
   result:[], //搜尋資料 
  }),
  
  getters: {
    filteredResult: (state) => {
      let filtered = [...state.result]; 
      
      
      // 過濾營業中
      if (state.isOpen) {
        filtered = filtered.filter((place) => place.openNow);
      }
      
      // 過濾價格分類
      if (state.selectedCost !== 'default') {
        filtered = filtered.filter((place) => {
          const price = place.startPrice || 0;
        if (state.selectedCost === 'cost1') return price <= 200;
        if (state.selectedCost === 'cost2') return price >= 200 && price < 400;
        if (state.selectedCost === 'cost3') return price >= 400 && price < 600;
        if (state.selectedCost === 'cost4') return price >= 600 && price < 800;
        if (state.selectedCost === 'cost5') return price >= 800 && price < 1000;
        if (state.selectedCost === 'cost6') return price >= 1000;
      });
      }
      // 與店家距離
      const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; 
        const toRadians = (deg) => deg * (Math.PI / 180); 
        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; 
      };
      
      filtered = filtered.map((place) => ({
        ...place,
        distance: calculateDistance(
          state.coordinate.lat, 
          state.coordinate.lng, 
          place.lat, 
          place.lng
        )
      }));
      
      // 排序
      const sortFunctions = {
        default: () => 0,
        rating: (a, b) => (b.rating || 0) - (a.rating || 0),
        reviews: (a, b) => (b.userRatingCount || 0) - (a.userRatingCount || 0),
        distance: (a, b) => a.distance - b.distance,
      };
      filtered.sort(sortFunctions[state.sortOrder]);
      return filtered;
    },
  },
  
  
  actions: {
     navigateToSearch(router, tag) {
      this.keyword = tag
      router.push({
        path: "/search",
        query: { keyword: tag },
      }).then(() => {
        // 確保導航完成後執行搜尋
        this.handleSearch();
      });
    },
    

    //取得keyword並搜尋
    setKeyword(value){
      this.keyword = value
    },
    async handleSearch(){
      if(!this.keyword || this.keyword == ""){
        alert("請輸入有效關鍵字!!!")
        return
      }
      const response = await axios.get(`http://localhost:3000/restaurants/search?keyword=${this.keyword}&lat=${this.coordinate.lat}&lng=${this.coordinate.lng}`)
      this.result = response.data
    },

    // 取得座標
    selectDistrict(districtName) {
      if (districtName === "我的位置"){
          navigator.geolocation.getCurrentPosition( (position) => {
            this.districts[districtName] = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                  })
                }
      if (this.districts[districtName]) {
        this.selectedDistrict = districtName
        this.coordinate = this.districts[districtName]
      }else if(this.districts["台北市"][districtName]){
        this.selectedDistrict = districtName
        this.coordinate = this.districts["台北市"][districtName]
      }else if(this.districts["新北市"][districtName]){
        this.selectedDistrict = districtName
        this.coordinate = this.districts["新北市"][districtName]
      }else {
        alert("尚未取得您的位置，請允許定位後再試！")
      }
    },

    setSortOrder(value){
      this.sortOrder = value
    },
    setOpen(){
      this.isOpen = !this.isOpen
    },
    setCostRange(value){
       this.selectedCost = value
   },
   setResult(value){
     this.result = value;
   },
    
   nearSearch(router, lat, lng){
    this.coordinate = {
      lat:lat,
      lng:lng
    }
    this.navigateToSearch(router, "餐廳")
   }
  }
})