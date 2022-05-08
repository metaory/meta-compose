<script setup>
import { ref, computed, onMounted } from 'vue'
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'url', label: 'Url', field: 'url', sortable: false },
  { name: 'thumbnailUrl', label: 'Thumbnail Url', field: 'thumbnailUrl', sortable: false },
  { name: 'isPrivate', label: 'Private', field: 'isPrivate', sortable: true, },
  { name: 'timesViewed', label: 'Times Viewed', field: 'timesViewed', sortable: true, },
]

const rows = ref([])
const total = ref(0)
const length = ref(0)
const loading = ref(true)

const fetchVideos = async (minViews = 0, isPrivate) => {
  loading.value = true

  const params = new URLSearchParams()
  params.set('page', 1)
  params.set('per_page', 1000)
  params.set('min_views', minViews)

  if (isPrivate !== undefined) params.set('is_private', isPrivate)

  const uri = `/api/videos?${params.toString()}`

  const data = await fetch(uri)
    .then(res => res.json())

  total.value = data.total
  length.value = data.length
  rows.value = data.list
  loading.value = false
}

const initialPagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 1000
}

onMounted(() => {
  fetchVideos()
})
</script>

<template>
  <h1>metaory</h1>
  <div class="q-ma-xl">
    <q-table
      title="Videos"
      color="cyan"
      dark
      bordered
      hide-bottom
      row-key="id"
      :pagination="initialPagination"
      :rows="rows"
      :columns="columns"
      :loading="loading"
    >
      <template v-slot:top>
        <h5 class="text-blue-grey-4 q-mr-sm">{{ length }}</h5>
        <h4 class="text-blue-grey">Videos</h4>
        <q-space />
        <q-btn
          @click="fetchVideos(0, 0)"
          :loading="loading"
          push
          rounded
          color="primary"
          label="Fetch Public Videos ONLY"
        />
        <q-btn
          @click="fetchVideos(42)"
          :loading="loading"
          push
          rounded
          class="q-mx-xl"
          color="secondary"
          label="Fetch Popular Videos (42+)"
        />
        <q-btn
          @click="fetchVideos(0)"
          :loading="loading"
          push
          round
          color="accent"
          dark
          icon="refresh"
        />
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-cyan">
            <b>{{ col.label }}</b>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" class="text-blue-grey">
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
              text-color="black"
              :color="props.row.timesViewed >= 42 ? 'positive' : 'warning'"
            >{{ String(props.row.timesViewed).padStart(2, '0') }}</q-badge>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style>
html {
  color: #213040;
  background: #161a22;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
.q-table--dark,
th,
td {
  border-color: rgb(44, 47, 58) !important;
}
h1 {
  background: -webkit-linear-gradient(45deg, #0077b6, #e84171);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
