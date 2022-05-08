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
const filter = ref('')
const loading = ref(true)
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 1000,
  rowsNumber: 0
})

const pagesNumber = computed(() => {
  return Math.ceil(rows.length / pagination.value.rowsPerPage)
})

import querystring from 'querystring'
const sanatizeUrl = (url) => {
  const parsed = querystring.parse(url.split('?')[1])
  for (const key in parsed) { if (parsed[key] === 'null') delete parsed[key] }
  return url.split('?')[0] + '?' + querystring.stringify(parsed)
}
const fetchVideos = async (minViews = 0, isPrivate) => {
  loading.value = true
  const { page, rowsPerPage } = pagination.value

  const params = new URLSearchParams()
  params.set('page', page)
  params.set('per_page', rowsPerPage)
  params.set('min_views', minViews)

  if (isPrivate !== undefined) params.set('is_private', isPrivate)

  const uri = `/api/videos?${params.toString()}`

  const data = await fetch(uri)
    .then(res => res.json())

  total.value = data.total
  rows.value = data.list
  loading.value = false
}

onMounted(() => {
  fetchVideos()
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
      :pagination="pagination"
    >
      <template v-slot:top>
        <h4>Videos</h4>
        <q-space />
        <q-btn
          @click="fetchVideos(0, 0)"
          push
          rounded
          color="primary"
          label="Fetch Public Videos ONLY"
        />
        <q-btn
          @click="fetchVideos(42)"
          push
          rounded
          class="q-mx-xl"
          color="secondary"
          label="Fetch Popular Videos (42+)"
        />
        <q-btn @click="fetchVideos(0)" push round color="accent" dark icon="refresh" />
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
              :color="props.row.timesViewed >= 42 ? 'positive' : 'negative'"
            >{{ props.row.timesViewed }}</q-badge>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:pagination="scope">
        <q-btn
          icon="chevron_left"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isFirstPage"
          @click="scope.prevPage"
        />

        <q-btn
          icon="chevron_right"
          color="grey-8"
          round
          dense
          flat
          :disable="scope.isLastPage"
          @click="scope.nextPage"
        />
      </template>
    </q-table>
  </div>
</template>

<style>
.q-table__bottom > .q-table__control:nth-child(2) {
  display: none;
}
</style>
