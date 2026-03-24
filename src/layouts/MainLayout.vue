<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header elevated class="header-mes text-white">
      <q-toolbar>
        <q-toolbar-title class="row items-center">
          <!-- Logo -->
          <q-avatar>
            <img src="/img/AFL_Logo.svg"/>
          </q-avatar>

          <!-- “AFL” en cursiva -->
          <span class="text-italic text-weight-bold q-ml-sm">AFL</span>

          <!-- Separador vertical -->
          <q-separator vertical inset class="q-mx-sm" />

          <!-- Texto final -->
          <span class="text-subtitle2">Poland MES</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// No es necesario script por ahora
</script>

<style scoped>
.header-mes {
  background-color: #123962;
}
</style>
