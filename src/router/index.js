import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import UserProfile from '../views/UserProfile.vue'
import StorePage from '../views/StorePage.vue'
import SearchPage from '../views/SearchPage.vue'
import Login from '../components/Login.vue'
import MyArticle from '../views/MyArticle.vue'
import ArticleList from '../views/ArticleList.vue'
import {useAuth} from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/store',
    name: 'store',
    component: StorePage,
  },
  {
    path: '/user',
    name: 'user',
    component: UserProfile,
    meta: { requiresAuth: false },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchPage,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/myarticle',
    name: 'myArticle',
    component: MyArticle,
    meta: { requiresAuth: false },
  },
  {
    path: '/articlelist',
    name: 'articlelist',
    component: ArticleList,
  },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.beforeEach((to, from, next) => {
    const user = useAuth()
  
    // 檢查是否需要驗證（這裡檢查 meta.requiresData）
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // 假設你想檢查 store 中的某個物件是否為空
      if (!user.userData || Object.keys(user.userData).length === 0) {
        // 如果物件為空，跳轉到 Login 頁面
        alert("請登入")
        next({ name: 'home' })
      } else {
        // 通過檢查，繼續訪問目標頁面
        next()
      }
    } else {
      // 不需要檢查的頁面直接放行
      next()
    }
  })
  

export default router
