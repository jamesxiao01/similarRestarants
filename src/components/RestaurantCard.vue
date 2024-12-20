<template>
  <div class="box-border w-full md:w-1/2 pt-2 h-screen overflow-y-auto">
    <div class="flex top-16 flex-col bg-white box-border w-full space-x-0 md:top-6 z-50">
      <div class="flex flex-col">
        <div class="p-3 font-bold text-gray-500">
          <h3>台灣『美食餐廳』 | 精選TOP 15間熱門店家</h3>
        </div>

        <div class="hidden md:flex text-sm text-gray-600">
          <div class="px-3">
            <a href="#">台灣</a>
          </div>
          <div>
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </div>
          <div class="px-3">
            <span>所有餐廳</span>
          </div>
        </div>
      </div>

      <div class="relative flex flex-row items-start w-full px-2 mx-3">
        <!-- 餐廳排序 -->
        <div class="relative inline-block w-1/4 mx-1 md:w-1/6">
          <button
            @click="toggleSort"
            class="bg-amber-500 rounded-md text-white text-xs w-full mt-2 p-1 flex justify-between items-center">
            <div>
              <font-awesome-icon :icon="['fas', 'bars']" />
            </div>
            <span>{{ Search.sortOptions[Search.sortOrder] }}</span>
            <div>
              <font-awesome-icon :icon="['fas', 'chevron-down']" />
            </div>
          </button>
          <div
            v-if="sortMenu"
            class="bg-amber-400 rounded-md text-white text-xs w-full p-1 text-center absolute top-full left-0 mt-1 shadow-md z-10">
            <ul>
              <li
                v-for="(label, value) in sortOptions"
                :key="value"
                @click="setSortOrder(value)"
                class="cursor-pointer hover:bg-amber-500 py-1 z-10">
                <span>{{ label }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 價位分類 -->
        <div class="relative inline-block w-1/4 mx-1 md:w-1/6">
          <button
            @click="toggleCost"
            class="bg-amber-500 rounded-md text-white text-xs w-full mt-2 p-1 flex justify-between items-center">
            <div>
              <font-awesome-icon :icon="['fas', 'bars']" />
            </div>
            <span>{{ Search.costOptions[Search.selectedCost] }}</span>
            <div>
              <font-awesome-icon :icon="['fas', 'chevron-down']" />
            </div>
          </button>
          <div
            v-if="costMenu"
            class="bg-amber-400 rounded-md text-white text-xs w-full p-1 text-center absolute top-full left-0 mt-1 shadow-md z-10">
            <ul>
              <li
                v-for="(label, value) in costOptions"
                :key="value"
                @click="setCostRange(value)"
                class="cursor-pointer hover:bg-amber-500 py-1 ">
                <span>{{ label }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 篩選條件 -->
        <div class="w-1/4 p-1 mx-1 mt-2 text-xs text-center border rounded-md md:w-1/6 md:border-none">
          <label>
            <input type="checkbox" v-model="Search.isOpen"  > 營業中
          </label>
        </div>
        <div class="w-1/4 p-1 mx-1 mt-2 text-xs text-center border rounded-md md:w-1/6 md:border-none">
          <label>
            <input type="checkbox"> 可訂購
          </label>
        </div>
      </div>
    </div>
    
    <div 
    v-for="place in Search.filteredResult" 
    :key="place.id"
    :data-place-id="place.id"
    class="flex pt-1 items-center pb-2 border-b transition-colors duration-200"
    :class="{ 'bg-amber-200': restaurantStore.hoveredPlaceId === place.id }"
    @mouseenter="handleMouseEnter(place.id)"
    @mouseleave="handleMouseLeave">
      <div class="w-40 h-32 ml-3">
        <img v-if="place.photoId" :src="photoGet(place.photoId)" alt="Place image" class="object-cover w-full h-full" />
      </div>
      <div class="flex flex-col justify-between ml-3 sm:text-xl w-4/5">
        <div class="ml-3">
          <h2 class="font-bold text-gray-500 text-base h-6 w-[350px] text-ellipsis whitespace-nowrap overflow-hidden">
            <a href="#" class="text-amber-500 hover:text-orange-300" @click="StoreId(place.id)">{{ place.name }}</a>
          </h2>
        </div>
        <div class="flex mt-3 ml-3 text-xs">
          <div class="bg-red-600 mr-2 rounded-2xl text-white px-2 items-center">
            <p>{{ place.rating }} <font-awesome-icon :icon="['fas', 'star']" /></p>
          </div>
          <p class="mr-2 font-light">(評論數: {{ place.userRatingCount }})</p>
        </div>
        <div class="flex mt-3 ml-3 text-xs">
          <p v-if="!place.startPrice || !place.endPrice" class="mr-2 font-light">平均消費：未提供</p>
          <p v-else class="mr-2 font-light">平均消費： {{ place.startPrice}} ~ {{ place.endPrice}} 元</p>
          <p class="mr-2 font-light">距離 {{ place.distance.toFixed(2) || "??" }} 公里</p>
        </div>
        <div class="mt-3 mx-3 hidden md:flex items-center text-sm">
          <span>
            <font-awesome-icon 
              :icon="['fas' ,'circle']" 
              :style="{color:place?.openNow ? 'green' : 'gray', fontSize:'8px', margin:'2px'}" />
          </span>
          <p> {{ place?.openNow ? '營業中' : '已打烊' }}</p>
        </div>
        <div class="mt-3 ml-3 flex flex-wrap items-center">
        <!-- <span>
          <a href="#" 
            class="hidden md:block bg-gray-200 rounded-full px-3 py-1 text-sm mr-2 mb-1 items-center">
            <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="text-orange-400"/>
                相似餐廳
          </a>
        </span> -->
        <span>
          <button @click="Search.nearSearch(router, place.lat, place.lng)"
            class="hidden md:block bg-gray-200 rounded-full px-3 py-1 text-sm mr-2 mb-1 items-center">
            <font-awesome-icon :icon="['fas', 'location-dot']" class="text-orange-400"/>
                附近                 
          </button>
        </span>
      </div>  
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRestaurantStore } from '@/stores/searchPage';
import { useKeywordStore } from '../stores/keywordStore.js'
import { computed, ref } from 'vue'
import { useStore } from '../stores/storePage'
import { useRouter } from "vue-router";

const router = useRouter();
const restaurantStore = useRestaurantStore()
const Search = useKeywordStore()
const Store = useStore()



const handleMouseEnter = (placeId) => {
  restaurantStore.setHoveredPlace(placeId)
}
const handleMouseLeave = () => {
  restaurantStore.setHoveredPlace(null)
}


const StoreId = (placeId) => {
  Store.StoreId(router, placeId)
}

// const nearSearch = (lat, lng) => {
//   Search.nearSearch(router,lat ,lng)
// }

const sortMenu = ref(false);
const costMenu = ref(false);
const sortOptions = computed(() => Search.sortOptions)
const costOptions = computed(() => Search.costOptions)

const toggleSort = () => {
  sortMenu.value = !sortMenu.value;
};

const toggleCost = () => {
  costMenu.value = !costMenu.value;
};

const setSortOrder = (value)=> {
  Search.setSortOrder(value)
  toggleSort()
  };

const setCostRange = (value) => {
  Search.setCostRange(value)
  toggleCost()
};

const photoGet = (photoId) =>{
  return `http://localhost:3000/restaurants/photo?id=${photoId}`
} 
</script>