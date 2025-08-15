import { createWebHistory, createRouter } from 'vue-router'

const routes = [
    { path: '/', component: () => import('./views/HomeView.vue') },
    {
        path: '/terms-of-use',
        name: 'TermsOfUse',
        component: () => import('./views/TermsOfUseView.vue')
    },
    {
        path: '/privacy-policy',
        name: 'PrivacyPolicy',
        component: () => import('./views/PrivacyPolicyView.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 };
    }
})

export default router
