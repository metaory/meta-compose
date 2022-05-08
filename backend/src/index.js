const Koa = require('koa')
const Router = require('@koa/router')

const database = require("./database")
const { port } = require("./config")

const sleep = (s = 1) => new Promise(resolve => setTimeout(resolve, s * 1000))

const app = new Koa()
const bodyParser = require('koa-bodyparser')
const server = app.listen(port)
const router = new Router()

app.use(bodyParser())

app.use(async function(ctx, next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
  console.log('%s %s - %sms', ctx.method, ctx.url, ms)
})

router
  .get('/', async (ctx) => {
    ctx.body = { ok: true, message: 'Alive and breathing...' }
  })
  .get('/version', async (ctx) => {
    const [[version]] = await database.raw('select VERSION() version')
    ctx.body = { db: version }
  })

router
  .post('/videos', async (ctx) => {
    ctx.body = await database('videos').insert(ctx.request.body)
  })
  .get('/videos', async (ctx) => {
    const { query: { page = 1, per_page = 10, min_views = 0, public } } = ctx
    const offset = (page - 1) * per_page
    const [count] = await database.table('videos').count()
    const total = count['count(*)']

    let query = database.select()
      .table('videos')
      .where('timesViewed', '>=', min_views)

    if (public) query = query.where('isPrivate', 0)

    const list = await query
      .limit(per_page)
      .offset(offset)

    const { length } = list

    ctx.body = { total, length, list }
  })
  .get('/videos/:id', async (ctx) => {
    const [row] = await database.select()
      .table('videos')
      .where('id', ctx.params.id)
    ctx.body = row
  })
  .put('/videos/:id', (ctx) => {
    // TODO
    knex('books')
      .where('published_date', '<', 2000)
      .update({
        status: 'archived',
        thisKeyIsSkipped: undefined
      })

    ctx.body = 'put::videos::' + ctx.params.id
  })
  .del('/videos/:id', async (ctx) => {
    ctx.body = await database.select()
      .table('videos')
      .where('id', ctx.params.id)
      .del()
  })

app
  .use(router.routes())
  .use(router.allowedMethods())

process.on("SIGINT", () => {
  console.info("\nShutting Down...", new Date())
  server.close()
})
