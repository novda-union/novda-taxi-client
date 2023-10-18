import { Preferences } from "@capacitor/preferences";
import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { useAuth } from "@/store/auth";

const authStore = useAuth();

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "blank",
    redirect: "/ride/setDestination",
  },
  {
    path: "/ride",
    name: "default-layout",
    redirect: "/ride/setDestination",
  },
  {
    path: "/ride/setDestination",
    name: "layout-home-set-destination",
    component: () => import("@/pages/HomePage.vue"),
    async beforeEnter(to, from, next) {
      const { value: token } = await Preferences.get({ key: "auth_token" });
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });
      alert(token);

      if (
        (oneId === "undefined" && token === "undefined") ||
        (!oneId && !token) ||
        (oneId === "null" && token === "null") ||
        !oneId ||
        !token ||
        (!oneId && !token)
      ) {
        await Preferences.remove({ key: "clientOneId" });
        await Preferences.remove({ key: "auth_token" });

        next("/register");
      }

      const check = await authStore.check();

      if (check?.status === "ok") {
        next();
      }

      next("/register");
    },
  },
  {
    path: "/register",
    name: "register-layout",
    component: () => import("@/layouts/Register.vue"),
    async beforeEnter(to, from, next) {
      const { value: token } = await Preferences.get({ key: "auth_token" });
      const { value: oneId } = await Preferences.get({ key: "clientOneId" });
      alert(token);

      if (
        (oneId === "undefined" && token === "undefined") ||
        (!oneId && !token) ||
        (oneId === "null" && token === "null") ||
        !oneId ||
        !token ||
        (!oneId && !token)
      ) {
        next();
      }

      const check = await authStore.check();

      if (check?.status === "ok") {
        next();
      }

      next("/register");
    },
  },
  {
    path: "/no-internet",
    name: "no-internet",
    component: () => import("@/pages/NoInternetPage.vue"),
  },
  {
    path: "/no-gps",
    name: "no-gps",
    component: () => import("@/pages/NoGPSPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
