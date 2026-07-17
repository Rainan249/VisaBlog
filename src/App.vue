<script setup lang="ts">
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import CustomCursor from "./components/CustomCursor.vue";

const route = useRoute();
</script>

<template>
  <CustomCursor />
  <NavBar v-if="route.name !== 'post'" />
  <router-view />
</template>
