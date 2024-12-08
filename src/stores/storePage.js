import { ref, computed, onMounted, onUnmounted, watch, onErrorCaptured } from "vue";
import { defineStore } from "pinia";

export const useRestaurantStore = defineStore("restaurant", () => {
  const windowWidth = ref(window.innerWidth);
  const groupSize = ref(3);
  const totalItems = 20;

  // 基本資料的 ref
  const storeName = ref("");
  const rating = ref("");
  const userRatingCount = ref("");
  const startPrice = ref("");
  const endPrice = ref("");
  const weekdayDescriptions = ref("");
  const formattedAddress = ref("");
  const websiteUri = ref("");
  const nationalPhoneNumber = ref("");
  const storeMap = ref(null);
  const openNow = ref("");
  const storePhoto = ref("");
  const googleMapsUri = ref("");
  
  // 相似餐廳相關狀態
  const similarRestaurants = ref([]);
  const currentGroupIndex = ref(0);

  // 推薦餐廳相關狀態
  const recommendedRestaurants = ref([]);
  const recommendedGroupIndex = ref(0);
  const searchTopics = ref([]);
  
 // 視窗監聽器
  const initializeWindowListener = () => {
  const updateSize = () => {
    windowWidth.value = window.innerWidth;
  };
  window.addEventListener('resize', updateSize);
  updateSize();
};
  

  const fetchPlaceDetail = async () => {
    const apiBaseUrl = import.meta.env.VITE_PLACES_DETAIL_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    // FIXME
    const placesName = "places/ChIJPwFtMx-oQjQRyDjE21ZvByc";
    const fieldsMask =
      "id,displayName,photos,formattedAddress,googleMapsUri,currentOpeningHours,nationalPhoneNumber,priceRange,rating,websiteUri,userRatingCount";
    const langCode = "zh-TW";

    try {
      const res = await fetch(
        `${apiBaseUrl}${placesName}?fields=${fieldsMask}&key=${apiKey}&languageCode=${langCode}`
      );
      const resJson = await res.json();

      storeName.value = resJson.displayName.text;
      rating.value = resJson.rating;
      userRatingCount.value = resJson.userRatingCount;
      startPrice.value = resJson.priceRange.startPrice.units;
      endPrice.value = resJson.priceRange.endPrice.units;
      weekdayDescriptions.value =
        resJson.currentOpeningHours.weekdayDescriptions;
      formattedAddress.value = resJson.formattedAddress;
      websiteUri.value = resJson.websiteUri;
      nationalPhoneNumber.value = resJson.nationalPhoneNumber;
      googleMapsUri.value = resJson.googleMapsUri;
      openNow.value = resJson.currentOpeningHours.openNow;
    } catch (err) {
      console.log("Failed to fetch place detail from Google API.");
      console.log(err);
    }
  };

  const fetchPhotos = async () => {
    const apiBaseUrl = import.meta.env.VITE_PHOTOS_API_BASE_URL;
    const apiKey = import.meta.env.VITE_API_KEY;
    // FIXME
    const photosName =
      "places/ChIJPwFtMx-oQjQRyDjE21ZvByc/photos/AdDdOWrh62xmB7s8LhxpSHRtikDhi4_XyMKnQGP9aYKB-KCZrfdYTSsumwrfvoQu6YMI-X4_5wJJUH--CLZnYoySKfLDioyHMqyOfGf_3hxcT_jlfGW-Yla5yrv-6a3HDpvzfk3JhTVgDs8Ka3wguYr-VRwuxFT2NQ-KmMLW";

    try {
      const res = await fetch(
        `${apiBaseUrl}${photosName}/media?key=${apiKey}&maxHeightPx=800&maxWidthPx=800`
      );
      console.log(res);
      storePhoto.value = URL.createObjectURL(await res.blob());
    } catch (err) {
      console.log("Failed to fetch place photos from Google API.");
      console.log(err);
    }
  };

  const staticMapUrl = computed(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const zoom = 15; // 縮放級別
    const size = "160x160"; // 地圖大小
    const marker = "color:red|label"; // 標記點樣式
    
    // 如果沒有位置資訊，返回空
    if (!formattedAddress.value) return null;
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(formattedAddress.value)}&zoom=${zoom}&size=${size}&markers=${marker}|${encodeURIComponent(formattedAddress.value)}&key=${apiKey}`;
  });


  
  // 獲取類似餐廳
  const fetchSimilarRestaurants = async (apiKey, location, radius) => {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=restaurant&key=${apiKey}`
  
    try {
      console.log('Fetching similar restaurants...');
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
      const res = await fetch(proxyUrl + apiUrl)
  
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`)
      }
  
      const resJson = await res.json()
      console.log('API Response:', resJson); // 添加这行来查看 API 返回的数据
      
      if (resJson.status !== "OK") {
        console.error(`Google API Error: ${resJson.status}`, resJson.error_message)
        return
      }
  
      similarRestaurants.value = resJson.results.map((restaurant) => ({
        name: restaurant.name,
        rating: restaurant.rating || "N/A",
        userRatingCount: restaurant.user_ratings_total || 0,
        address: restaurant.vicinity || "Unknown Address",
        location: restaurant.geometry?.location,
        isOpen: restaurant.opening_hours?.open_now || false,
        photoUrl: restaurant.photos
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${apiKey}`
          : null,
        place_id: restaurant.place_id
      }))
      console.log('Mapped restaurants:', similarRestaurants.value); // 添加这行查看处理后的数据
      resetGroupIndex()
    } catch (err) {
      console.error("Fetch error:", err.message)
    }
  }
  
  // maxGroupIndex 計算
  const maxGroupIndex = computed(() => {
    if (!similarRestaurants.value?.length) return 0;
    const itemsPerPage = windowWidth.value >= 768 ? 3 : 2;
    return Math.ceil(totalItems / itemsPerPage) - 1;
  });


  // 當前頁面顯示的餐廳
  const currentGroupRestaurants = computed(() => {
    const start = currentGroupIndex.value * groupSize;
    const end = start + groupSize;
    return similarRestaurants.value.slice(start, end);
  });

   // 修改導航方法以使用新的計算邏輯
  const nextGroup = () => {
    if (currentGroupIndex.value >= maxGroupIndex.value) {
      currentGroupIndex.value = 0;
    } else {
      currentGroupIndex.value++;
    }
  };

  const prevGroup = () => {
    if (currentGroupIndex.value <= 0) {
      currentGroupIndex.value = maxGroupIndex.value;
    } else {
      currentGroupIndex.value--;
    }
  };

   // displayRestaurants 計算
  const displayRestaurants = computed(() => {
    const restaurants = similarRestaurants.value || [];
    if (!restaurants.length) return [];
    
    const itemsPerPage = windowWidth.value >= 768 ? 3 : 2;
    const start = currentGroupIndex.value * itemsPerPage;
    
    let allRestaurants = [];
    while (allRestaurants.length < totalItems) {
      allRestaurants = [...allRestaurants, ...restaurants];
    }
    allRestaurants = allRestaurants.slice(0, totalItems);
    
    return allRestaurants
      .slice(start, start + itemsPerPage)
      .map((restaurant, index) => ({
        ...restaurant,
        uniqueId: `${restaurant.place_id}-${currentGroupIndex.value}-${index}`
      }));
  });


  // 推薦餐廳的方法
  const nextRecommendedGroup = () => {
    if (recommendedGroupIndex.value >= maxRecommendedGroupIndex.value) {
      recommendedGroupIndex.value = 0;
    } else {
      recommendedGroupIndex.value++;
    }
  };

  const prevRecommendedGroup = () => {
    if (recommendedGroupIndex.value <= 0) {
      recommendedGroupIndex.value = maxRecommendedGroupIndex.value;
    } else {
      recommendedGroupIndex.value--;
    }
};


// 修改 maxRecommendedGroupIndex 計算
const maxRecommendedGroupIndex = computed(() => {
  if (!recommendedRestaurants.value?.length) return 0;
  // 根據螢幕寬度決定每頁顯示數量
  const itemsPerPage = windowWidth.value >= 768 ? 3 : 2;
  // 計算總頁數
  return Math.ceil(12 / itemsPerPage) - 1; // 12組資料，大螢幕4頁，小螢幕6頁
});

// 修改 displayRecommendedRestaurants 計算
const displayRecommendedRestaurants = computed(() => {
  const restaurants = recommendedRestaurants.value || [];
  if (!restaurants.length) return [];

  const itemsPerPage = windowWidth.value >= 768 ? 3 : 2;
  const start = recommendedGroupIndex.value * itemsPerPage;
  
  // 當資料不足時，重複資料來填滿所有頁面
  let repeatedData = [];
  while (repeatedData.length < 12) { // 確保至少有 12 筆資料
    repeatedData = [...repeatedData, ...restaurants];
  }
  
  return repeatedData
    .slice(start, start + itemsPerPage)
    .map((restaurant, index) => ({
      ...restaurant,
      uniqueId: `${restaurant.place_id}-${recommendedGroupIndex.value}-${index}`
    }));
});
  
  // 獲取推薦餐廳（不同種類）
  const fetchRecommendedRestaurants = async (apiKey, location, radius) => {
    // 定義不同的餐廳類型
    const restaurantTypes = ['cafe', 'bakery', 'bar', 'meal_takeaway'];
    let allRestaurants = [];

    try {
      // 為每種類型獲取餐廳
      for (const type of restaurantTypes) {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`;
        
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const res = await fetch(proxyUrl + apiUrl);

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const resJson = await res.json();
        
        if (resJson.status === "OK") {
          // 從每種類型選取前幾個結果
          const typeRestaurants = resJson.results.slice(0, 3).map((restaurant) => ({
            name: restaurant.name,
            rating: restaurant.rating || "N/A",
            userRatingCount: restaurant.user_ratings_total || 0,
            photoUrl: restaurant.photos
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${restaurant.photos[0].photo_reference}&key=${apiKey}`
              : null,
            place_id: restaurant.place_id,
            type: type // 添加類型標記
          }));
          
          allRestaurants = [...allRestaurants, ...typeRestaurants];
        }
      }

      // 隨機打亂結果
      recommendedRestaurants.value = allRestaurants
        .sort(() => Math.random() - 0.5)
        .slice(0, 15); // 限制總數量

      recommendedGroupIndex.value = 0;
    } catch (err) {
      console.error("Fetch recommended restaurants error:", err.message);
    }
  };
  
// 重置索引
const resetGroupIndex = () => {
  currentGroupIndex.value = 0;
  recommendedGroupIndex.value = 0;
};


  const fetchSearchTopics = async () => {
    try {
      // 獲取搜尋主題的 API 調用
      const apiBaseUrl = import.meta.env.VITE_SEARCH_TOPICS_API_BASE_URL;
      const apiKey = import.meta.env.VITE_API_KEY;
      const placesId = "ChIJPwFtMx-oQjQRyDjE21ZvByc"; // 替換為實際的 placesId
  
      const res = await fetch(
        `${apiBaseUrl}/topics?placesId=${placesId}&key=${apiKey}`
      );
      const resJson = await res.json();
  
      searchTopics.value = resJson.topics || [];
    } catch (err) {
      console.log("Failed to fetch search topics from API.");
      console.log(err);
    }
  };


  return {
    // 視窗相關
    windowWidth,
    initializeWindowListener,
    groupSize,
    
    // 基本資料
    storeName,
    rating,
    userRatingCount,
    startPrice,
    endPrice,
    weekdayDescriptions,
    formattedAddress,
    websiteUri,
    nationalPhoneNumber,
    storePhoto,
    storeMap,
    googleMapsUri,
    openNow,
    
    // API 方法
    fetchPlaceDetail,
    fetchPhotos,
    staticMapUrl,
    
    // 相似餐廳相關
    similarRestaurants,
    currentGroupIndex,
    maxGroupIndex,
    displayRestaurants,
    nextGroup,
    prevGroup,
    fetchSimilarRestaurants,
    
    // 推薦餐廳相關
    recommendedRestaurants,
    recommendedGroupIndex,
    maxRecommendedGroupIndex,
    displayRecommendedRestaurants,
    nextRecommendedGroup,
    prevRecommendedGroup,
    fetchRecommendedRestaurants,
    
    // 其他
    searchTopics,
    fetchSearchTopics,
  };
});
