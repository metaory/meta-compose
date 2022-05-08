const knex = require('knex')
const axios = require("axios")
const { database } = require('./config')
const chance = new (require('chance'))
const length = 100

const db = module.exports = knex({
  client: 'mysql2',
  connection: database,
})

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

async function getRandomImagePath() {
  await sleep(10) // to avoid unsplash ratelimit
  const {
    request: { res: { responseUrl } }
  } = await axios.get("https://source.unsplash.com/random/128x128")
  return responseUrl
}

async function populate() {
  const exists = await db.schema.hasTable('videos')
  if (exists) return
  // uncomment to repopulate db on every run
  // if (exists) await db.schema.dropTable('videos')

  console.log('Populating in 6s...')
  await sleep(6000)

  await db.schema.withSchema('example').createTable('videos', (table) => {
    table.increments()
    table.string('name')
    table.string('url').defaultTo('NA')
    table.string('thumbnailUrl').defaultTo('NA')
    table.boolean('isPrivate').defaultTo(false)
    table.integer('timesViewed').defaultTo(0)
  })
  for (const [i] of Array.from({ length }).entries()) {
    const thumbnailUrl = await getRandomImagePath()
    await db('videos').insert({
      name: chance.name(),
      url: chance.url(),
      thumbnailUrl,
      isPrivate: chance.bool(),
      timesViewed: chance.integer({ min: 0, max: 100 })
    })
    console.log('Inserted row', i)
  }
}

populate()
  .then(console.log)
  .catch(console.error)

