<script setup>
import { ref } from 'vue'
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'url', label: 'Url', field: 'url', sortable: false },
  { name: 'thumbnailUrl', label: 'Thumbnail Url', field: 'thumbnailUrl', sortable: false },
  { name: 'isPrivate', label: 'Private', field: 'isPrivate', sortable: true, },
  { name: 'timesViewed', label: 'Times Viewed', field: 'timesViewed', sortable: true, },
]

const rows = ref([])
const total = ref([])
const filter = ref('')
const loading = ref(true)
// const rows = await fetch('/api/videos').then((r) => r.json())
loading.value = false

fetch("/api/videos")
  .then(res => res.json())
  .then(res => {
    loading.value = false
    rows.value = res.list
    total.value = res.total
  })
function onRequest(props) {
  console.log('@ON:REQUEST', props)
}
</script>

<template>
  <h1>metaory</h1>
  <div class="q-ma-xl">
    <!-- @request="onRequest" -->
    <q-table
      title="Videos"
      color="cyan"
      dark
      row-key="id"
      @request="onRequest"
      :rowsNumber="total"
      :filter="filter"
      :rows="rows"
      :columns="columns"
      :loading="loading"
    >
      <template v-slot:top-right>
        <q-input borderless dark dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-cyan">
            <b>{{ col.label }}</b>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="url" :props="props">{{ props.row.url }}</q-td>
          <q-td key="thumbnailUrl" :props="props">
            <img width="64" :src="props.row.thumbnailUrl" />
          </q-td>
          <q-td key="isPrivate" :props="props">
            <q-badge
              class="text-h6"
              text-color="black"
              outline
              :color="props.row.isPrivate ? 'warning' : 'positive'"
            >{{ props.row.isPrivate ? 'Private' : 'Public' }}</q-badge>
          </q-td>
          <q-td key="timesViewed" :props="props">
            <q-badge
              class="text-bold text-h6"
              text-color="white"
              color="accent"
            >{{ props.row.timesViewed }}</q-badge>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style scoped>
</style>
