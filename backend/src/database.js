const knex = require('knex')
const axios = require("axios")
const { database } = require('./config')
const chance = new (require('chance'))
const length = 10

const db = module.exports = knex({
  client: 'mysql2',
  connection: database,
})

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

async function getRandomImagePath() {
  await sleep(300) // to avoid unsplash ratelimit
  const {
    request: { res: { responseUrl } }
  } = await axios.get("https://source.unsplash.com/random/128x128")
  return responseUrl
}

async function populate() {
  console.log('Populating in 3s...')
  await sleep(3000)

  const exists = await db.schema.hasTable('videos')
  if (exists) await db.schema.dropTable('videos')

  await db.schema.withSchema('example').createTable('videos', (table) => {
    table.increments()
    table.string('name')
    table.string('thumbnailUrl').defaultTo('NA')
    table.boolean('isPrivate').defaultTo(false)
    table.integer('timesViewed').defaultTo(0)
  })
  // Array.from({ length: 20 }).map(async () => {
  for (const item of Array.from({ length })) {
    const thumbnailUrl = await getRandomImagePath()
    await db('videos').insert({
      name: chance.name(),
      thumbnailUrl,
      isPrivate: chance.bool(),
      timesViewed: chance.integer({ min: 0, max: 100 })
    })
    console.log('Inserted row')
  }
}

populate()
  .then(console.log)
  .catch(console.error)



