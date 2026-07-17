<script setup lang="ts">
import NavBar from "./components/NavBar.vue";
import CustomCursor from "./components/CustomCursor.vue";
</script>

<template>
  <CustomCursor />
  <NavBar />
  <router-view />
</template>
