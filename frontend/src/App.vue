<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

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
const confirm = () => new Promise((resolve) => {
  $q.dialog({
    title: 'Confirm',
    dark: true,
    message: 'Are you sure?',
    cancel: true,
    persistent: true
  }).onOk(resolve)
})
const dialog = (message, model = '') => new Promise((resolve) => {
  $q.dialog({
    title: 'Prompt',
    dark: true,
    message,
    prompt: { model, type: 'text' },
    cancel: true,
    persistent: true
  }).onOk(resolve)
})
const deleteVideo = async (row, b) => {
  console.log('D>>', row, b)
  await confirm()
  const res = await fetch(`/api/videos/${row.id}`, {
    method: 'DELETE',
  })
  await fetchVideos()
}
const editVideo = async (row) => {
  const newVideoName = await dialog('Enter new Name', row.name)
  const updatedModel = {
    ...row,
    isPrivate: Boolean(row.isPrivate),
    name: newVideoName,
  }
  delete updatedModel.id

  await fetch(`/api/videos/${row.id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedModel)
  })

  await fetchVideos()
}
const createVideo = async () => {
  const videoName = await dialog('What is your video name?')

  await fetch('/api/videos', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: videoName,
      url: 'https://fake.com',
      thumbnailUrl: 'https://images.unsplash.com/photo-1651035157347-e92d6a3cd958?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=128&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY1MTk5MDMwMA&ixlib=rb-1.2.1&q=80&w=128',
      isPrivate: true,
      timesViewed: 0
    })
  })

  await fetchVideos()
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
        <q-btn push @click="createVideo" dark color="positive" icon="add" class="q-mr-lg" />
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
          <q-th class="text-cyan">actions</q-th>
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
          <q-td>
            <q-btn-group push>
              <q-btn
                @click="editVideo(props.row)"
                push
                dark
                class="text-yellow"
                color="blue-grey-9"
                icon="edit"
              />
              <q-btn
                @click="deleteVideo(props.row)"
                push
                dark
                class="text-red"
                color="blue-grey-9"
                icon="delete"
              />
            </q-btn-group>
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
