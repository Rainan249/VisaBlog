<script setup lang="ts">
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import CustomCursor from "./components/CustomCursor.vue";
import TopProgress from "./components/TopProgress.vue";
import ClickRipple from "./components/ClickRipple.vue";

const route = useRoute();
</script>

<template>
  <TopProgress />
  <CustomCursor v-if="route.name !== 'admin'" />
  <ClickRipple v-if="route.name !== 'admin'" />
  <NavBar v-if="route.name !== 'post' && route.name !== 'admin'" />
  <router-view />
</template>
