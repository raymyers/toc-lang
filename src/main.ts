import { createApp } from "vue"
import { createRouter, createWebHashHistory } from "vue-router"
import App from "./App.vue"
import Draw from "./Draw.vue"
import About from "./About.vue"
import ErrorPage from "./ErrorPage.vue"
import "./index.css"

const routes = [
  {
    path: "/",
    component: App,
    children: [
      {
        path: "",
        redirect: "/draw"
      },
      {
        path: "draw",
        component: Draw
      },
      {
        path: "about",
        component: About
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*",
    component: ErrorPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount("#root-reset")
