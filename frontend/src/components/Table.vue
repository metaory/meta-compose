<script setup>
import { ref } from 'vue'
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true },
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'thumbnailUrl', label: 'Thumbnail Url', field: 'thumbnailUrl', sortable: true },
  { name: 'isPrivate', label: 'Private', field: 'isPrivate', sortable: true, },
  { name: 'timesViewed', label: 'Times Viewed', field: 'timesViewed', sortable: true, },

  // { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
  // { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
  // { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
]

// const rows = [
//   { id: 1, name: 'Frozen Yogurt', thumbnailUrl: 'URL', isPrivate: 1, timesViewed: 24, },
//   { id: 2, name: 'Ice cream sandwich', thumbnailUrl: 'URL', isPrivate: 0, timesViewed: 37, },
//   { id: 3, name: 'Eclair', thumbnailUrl: 'URL', isPrivate: 1, timesViewed: 23, },
//   { id: 4, name: 'Cupcake', thumbnailUrl: 'URL', isPrivate: 0, timesViewed: 67, },
//   { id: 5, name: 'Gingerbread', thumbnailUrl: 'URL', isPrivate: 1, timesViewed: 49, },
//   { id: 6, name: 'Jelly bean', thumbnailUrl: 'URL', isPrivate: 0, timesViewed: 94, },
//   { id: 7, name: 'Lollipop', thumbnailUrl: 'URL', isPrivate: 0, timesViewed: 98, },
//   { id: 8, name: 'Honeycomb', thumbnailUrl: 'URL', isPrivate: 1, timesViewed: 87, },
//   { id: 9, name: 'Donut', thumbnailUrl: 'URL', isPrivate: 0, timesViewed: 51, },
// ]

const rows = ref([])
fetch("/api/videos")
  .then(res => res.json())
  .then(res => {
    console.log(res, '<<<')
    rows.value = res
  })
</script>

<template>
  <h1>metaory</h1>
  <div class="q-ma-xl">
      <!-- @request="onRequest" -->
    <q-table title="Videos" color="cyan" dark :rows="rows" :columns="columns" row-key="name">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">{{ props.row.id }}</q-td>
          <q-td key="name" :props="props">{{ props.row.name }}</q-td>
          <q-td key="thumbnailUrl" :props="props">
            <img :src="props.row.thumbnailUrl" />
          </q-td>
          <q-td key="isPrivate" :props="props">
            <q-badge
              text-color="black"
              :color="props.row.isPrivate ? 'warning' : 'positive'"
            >{{ props.row.isPrivate ? 'Private' : 'Public' }}</q-badge>
          </q-td>
          <q-td key="timesViewed" :props="props">
            <!-- <q-badge text-color="black" rounded color="secondary">{{ props.row.timesViewed }}</q-badge> -->
            <q-badge text-color="black" rounded color="primary"><h6>{{ props.row.timesViewed }}</h6></q-badge>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style scoped>
</style>
