const Koa = require('koa')
const Router = require('@koa/router')

const database = require("./database")
const { port } = require("./config")

const sleep = (s = 1) => new Promise(resolve => setTimeout(resolve, s * 1000))

const app = new Koa()
const server = app.listen(port)
const router = new Router()

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
  .post('/videos', (ctx) => {
    ctx.body = 'post::videos'
  })
  .get('/videos', async (ctx) => {
    const { query: { page = 1, per_page = 10, min_views = 0 } } = ctx
    const offset = (page - 1) * per_page
    const [count] = await database.table('videos').count()
    const total = count['count(*)']

    const list = await database.select()
      .table('videos')
      .where('timesViewed', '>=', min_views)
      .limit(per_page)
      .offset(offset)

    ctx.body = { total, list }
  })
  .get('/videos/:id', (ctx) => {
    console.log('params', ctx.params.id)
    ctx.body = 'get::videos::' + ctx.params.id
  })
  .put('/videos/:id', (ctx) => {
    ctx.body = 'put::videos::' + ctx.params.id
  })
  .del('/videos/:id', (ctx) => {
    ctx.body = 'put::videos::' + ctx.params.id
  })

app
  .use(router.routes())
  .use(router.allowedMethods())

process.on("SIGINT", () => {
  console.info("\nShutting Down...", new Date())
  server.close()
})
