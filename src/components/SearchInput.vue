<script setup>
import { useKeywordStore } from '../stores/keywordStore.js'
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router';

const router = useRouter()
const route = useRoute()
const Search = useKeywordStore()

const keyword = computed( {
  get:() => Search.keyword,
  set:(value) => Search.setKeyword(value)
}) 

const selectedDistrict = computed({
  get: () => Search.selectedDistrict, 
  set: (value) => Search.selectDistrict(value) 
})

const districts = computed(() => Search.districts)

const handleEnterKey = () => {
  if(keyword.value){
    Search.navigateToSearch(router, keyword.value)
  }else{
    alert("請輸入有效關鍵字!!!")  
  }
}
const myLocation = computed(() => {
  return "我的位置" in districts.value ? ["我的位置"] : [];
});
const singleCities = computed(() => {
      return Object.entries(districts.value).filter(
        ([key, value]) => value && value.lat // 單一縣市 (有 lat 和 lng 的資料)
      );
    });

    const multiCities = computed(() => {
      return Object.entries(districts.value).filter(
        ([key, value]) => value && typeof value === "object" && !value.lat // 多行政區縣市 (包含子行政區)
      );
    });

watch(
  () =>
  route.query.keyword,
  (newKeyword) => {
    if (newKeyword !== Search.keyword) {
      Search.setKeyword(newKeyword || ""); 
      handleEnterKey();
    }
  }
);

</script>


<template>
  <!-- 統一的搜尋框 -->
  <form
    class="flex items-center px-4 space-x-2 bg-white border rounded-full shadow-sm border-amber-500 h-11 md:space-x-4 w-full"
    @submit.prevent="handleEnterKey">
    <!-- 輸入框 -->
    <div class="flex-grow">
      <input
        type="text"
        v-model="keyword"
        id="keyword"
        placeholder="美食分類、餐廳"
        class="w-full text-amber-500 placeholder-amber-300 px-2 py-1 outline-none"
      />
    </div>
    
    <!-- 桌面版餐廳圖示 -->
    <font-awesome-icon :icon="['fas', 'utensils']" class="w-5 h-5 text-amber-500 md:block hidden" />
    
    <div class="h-full mx-2 -my-2 border-l border-gray-300"></div>
    
    <!-- 地區選擇框 (桌面版) -->
    <div class="hidden md:flex items-center space-x-1 border-[1.5px] border-amber-100 text-amber-500 rounded-full px-3 py-1">
      <select 
        class="outline-none" 
        v-model="selectedDistrict" 
        id="district"
      >
      <option 
    v-for="location in myLocation" 
    :key="location" 
    :value="location"
  >
    {{ location }}
  </option>
      <!-- 含多行政區的縣市 -->
      <optgroup 
        v-for="([city, subDistricts]) in multiCities" 
        :key="city" 
        :label="city"
      >
        <option 
          v-for="(coords, subDistrict) in subDistricts" 
          :key="subDistrict" 
          :value="subDistrict"
        >
          {{ subDistrict }}
        </option>
      </optgroup>
  <!-- 單一縣市 -->
  <option 
    v-for="([city, coords]) in singleCities" 
    :key="city" 
    :value="city"
  >
    {{ city }}
  </option>

</select>

    </div>
    
    <!-- 地圖圖示 -->
    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="w-5 h-5 text-amber-500" />
    
    <!-- 搜尋按鈕 -->
    <button
      class="px-4 py-1 text-white rounded-full shadow-md bg-amber-500 focus:outline-none cursor-pointer">
      <font-awesome-icon :icon="['fas', 'search']" class="w-4 h-4" />
    </button>
  </form>
</template>
