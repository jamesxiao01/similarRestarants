import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useStore = defineStore("store", () => {
  // 基本資料的 ref
  const storeName = ref("");
  const rating = ref("");
  const userRatingCount = ref("");
  const startPrice = ref("");
  const endPrice = ref("");
  const weekDayDescriptions = ref("");
  const formattedAddress = ref("");
  const websiteUri = ref("");
  const nationalPhoneNumber = ref("");
  const openNow = ref("");
  const storePhoto = ref("");
  const googleMapsUri = ref("");
  const bannerPhoto = ref("");
  const lat = ref("");
  const lng = ref("");

  let placesId = ""

  const StoreId = (router, placeId) => {
    placesId = placeId
    router.push({
      path: "/store",
    })
  }

  // 相似餐廳相關狀態
  const similarRestaurants = ref([]);
  
  // 推薦餐廳相關狀態
  const recommendedRestaurants = ref([]);

  const photoIds = [];
  const fetchPlaceDetail = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/restaurants/details?id=${placesId}`
      );
      const resJson = await res.json();

      storeName.value = resJson.displayName;
      rating.value = resJson.rating;
      userRatingCount.value = resJson.userRatingCount;
      startPrice.value = resJson.startPrice;
      endPrice.value = resJson.endPrice;
      weekDayDescriptions.value = resJson.weekDayDescriptions;
      formattedAddress.value = resJson.formattedAddress;
      websiteUri.value = resJson.websiteUri;
      nationalPhoneNumber.value = resJson.nationalPhoneNumber;
      googleMapsUri.value = resJson.googleMapsUri;
      openNow.value = resJson.openNow;
      lat.value = resJson.lat;
      lng.value = resJson.lng;
      resJson.photoIds.forEach((id) => {
        photoIds.push(id);
      }); //一個array含兩組id
      console.log(photoIds);
    } catch (err) {
      console.log("Failed to fetch place detail from Google API.");
      console.log(err);
    }
  };

  const fetchStorePhoto = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/restaurants/photo?id=${photoIds[0]}`
      );
      console.log(res);
      storePhoto.value = URL.createObjectURL(await res.blob());
    } catch (err) {
      console.log("Failed to fetch place photos from Google API.");
      console.log(err);
    }
  };

  const fetchBannerPhoto = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/restaurants/photo?id=${photoIds[1]}`
      );
      console.log(res);
      bannerPhoto.value = URL.createObjectURL(await res.blob());
    } catch (err) {
      console.log("Failed to fetch place photos from Google API.");
      console.log(err);
    }
  };

  const staticMapUrl = computed(() => {
    // 如果沒有位置資訊，返回空
    if (!formattedAddress.value || !lat.value || !lng.value) return null;

    return `http://localhost:3000/restaurants/staticmap?lat=${lat.value}&lng=${lng.value}`;
  });

  // 獲取類似餐廳
  const fetchSimilarRestaurants = async () => {
    try {
      console.log('正在獲取相似餐廳...');
      console.log('當前餐廳 ID:', placesId);

      if (!placesId) {
        console.error('缺少 placesId');
        return;
      }

      // 先獲取當前餐廳的詳細資訊
      const detailRes = await fetch(
        `http://localhost:3000/restaurants/details?id=${placesId}`
      );

      if (!detailRes.ok) {
        throw new Error(`HTTP Error: ${detailRes.status}`);
      }

      const detailData = await detailRes.json();
      console.log('當前餐廳詳細資訊:', detailData);

      // 使用當前餐廳的位置搜尋附近餐廳
      const searchRes = await fetch(
        `http://localhost:3000/restaurants/search?keyword=餐廳&lat=${detailData.lat}&lng=${detailData.lng}`
      );

      if (!searchRes.ok) {
        throw new Error(`HTTP Error: ${searchRes.status}`);
      }

      const resJson = await searchRes.json();
      console.log('搜尋結果:', resJson);

      // 使用 Set 來儲存已經添加的餐廳 ID
      const addedIds = new Set();
      
      // 過濾掉當前餐廳和重複的餐廳
      similarRestaurants.value = resJson
        .filter(restaurant => {
          // 如果是當前餐廳或已經添加過，則跳過
          if (restaurant.id === placesId || addedIds.has(restaurant.id)) {
            return false;
          }
          // 將餐廳 ID 加入已添加集合
          addedIds.add(restaurant.id);
          return true;
        })
        .map((restaurant) => ({
          name: restaurant.name,
          rating: restaurant.rating || "N/A",
          userRatingCount: restaurant.userRatingCount || 0,
          address: restaurant.address || "未知地址",
          isOpen: restaurant.openNow || false,
          photoUrl: restaurant.photoId ?
            `http://localhost:3000/restaurants/photo?id=${restaurant.photoId}` : null,
          place_id: restaurant.id,
          googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${restaurant.id}`
        }))
        .slice(0, 15); // 限制顯示 15 間餐廳

      console.log('處理後的相似餐廳:', similarRestaurants.value);
    } catch (err) {
      console.error("獲取相似餐廳失敗:", err);
      similarRestaurants.value = [];
    }
  };

  const fetchRecommendedRestaurants = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/restaurants/search?keyword=餐廳`
      );

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const resJson = await res.json();
      
      // 獲取相似餐廳的 ID 列表
      const similarRestaurantIds = similarRestaurants.value.map(r => r.place_id);
      
      // 使用 Set 來儲存已經添加的餐廳 ID
      const addedIds = new Set();
      
      // 過濾掉當前餐廳、相似餐廳和重複的餐廳
      recommendedRestaurants.value = resJson
        .filter(restaurant => {
          // 如果是當前餐廳、相似餐廳或已經添加過，則跳過
          if (
            restaurant.id === placesId || 
            similarRestaurantIds.includes(restaurant.id) ||
            addedIds.has(restaurant.id)
          ) {
            return false;
          }
          // 將餐廳 ID 加入已添加集合
          addedIds.add(restaurant.id);
          return true;
        })
        .map(restaurant => ({
          name: restaurant.name,
          rating: restaurant.rating || "N/A",
          userRatingCount: restaurant.userRatingCount || 0,
          photoUrl: restaurant.photoId ?
            `http://localhost:3000/restaurants/photo?id=${restaurant.photoId}` : null,
          place_id: restaurant.id,
          googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${restaurant.id}`
        }))
        .slice(0, 15);

    } catch (err) {
      console.error("獲取推薦餐廳失敗:", err);
      recommendedRestaurants.value = [];
    }
  };

  return {
    // 基本資料
    storeName,
    rating,
    userRatingCount,
    startPrice,
    endPrice,
    weekDayDescriptions,
    formattedAddress,
    websiteUri,
    nationalPhoneNumber,
    storePhoto,
    bannerPhoto,
    googleMapsUri,
    openNow,
    StoreId,

    // API 方法
    fetchPlaceDetail,
    fetchStorePhoto,
    fetchBannerPhoto,
    staticMapUrl,
    // 相似餐廳相關
    similarRestaurants,
    fetchSimilarRestaurants,
    // 推薦餐廳相關
    recommendedRestaurants,
    fetchRecommendedRestaurants,
    lat,
    lng,
  };
});
