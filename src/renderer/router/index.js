import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// 路由实现跟vue中的相同
export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/containers/Compress').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
