<template>
<div  v-if="visible" class="modal-overlay bg-black/50 w-full h-screen flex justify-center items-center fixed top-0 left-0 z-50 ml-0" @click.self="closeModal">
        <div class="flex-col w-1/5 min-w-[260px] h-1/2 justify-items-center bg-white rounded-lg p-3 leading-10">
            <h1>登入 「 JiaBaMap 」</h1>
            <div class="">
                <img src="../assets/logo.jpg" alt="">
            </div>
            <p class="m-3 mb-12">按下登入以使用更多功能！！</p>
            <div id="googleButton"></div>
            <div v-if="userData" class="user-info">
                <h3>登錄成功！</h3>
                <p>名稱：{{ userData.name }}</p>
                <p>Email：{{ userData.email }}</p>
                <img :src="userData.picture" alt="用戶頭像" />
                <button @click="logout">登出</button>
              </div>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, watch, nextTick} from "vue";
import { useAuth } from '../stores/authStore';


const user = useAuth();


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});


const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close'); // 觸發父組件的 close 事件
};

watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        user.initializeGoogleButton();
      });
    }
  }
);

onMounted(() => {
  if (props.visible) {
    nextTick(() => {
      user.initializeGoogleButton();
    });
  }
});



</script>


<style scoped>
  
    </style>

