const Koa = require('koa')
const Router = require('@koa/router')
const Joi = require('joi')
const bodyParser = require('koa-bodyparser')

const database = require("./database")
const { port } = require("./config")

const schema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  url: Joi.string().uri().required(),
  thumbnailUrl: Joi.string().uri().required(),
  isPrivate: Joi.boolean().required(),
  timesViewed: Joi.number().integer().required(),
})

const app = new Koa()
const server = app.listen(port)
const router = new Router()

app.use(bodyParser())

app.use(async function(ctx, next) {
  const start = Date.now()
  try {
    await next()
    ctx.body = { ok: true, ...ctx.body }
  } catch (error) {
    ctx.body = { ok: false, message: error.message }
  }
  finally {
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ms}ms`)
    console.log('%s %s - %sms', ctx.method, ctx.url, ms)
  }
})

const pulseHandler = async (ctx) => {
  ctx.body = { ok: true, message: 'Alive and breathing...' }
}

router
  .get('/', pulseHandler)
  .get('/pulse', pulseHandler)
  .get('/version', async (ctx) => {
    const [[version]] = await database.raw('select VERSION() version')
    ctx.body = { db: version }
  })

router
  .get('/videos', async (ctx) => {
    const { query:
      { page = 1, per_page = 10, min_views = 0, is_private }
    } = ctx
    const offset = (page - 1) * per_page
    const [count] = await database.table('videos').count()
    const total = count['count(*)']

    let query = database.select()
      .table('videos')
      .where('timesViewed', '>=', min_views)

    if (is_private !== undefined) query = query.where('isPrivate', is_private)

    const list = await query
      .limit(per_page)
      .offset(offset)
      .orderBy(min_views > 0 ? 'timesViewed' : 'id', 'desc')

    const { length } = list

    ctx.body = { total, length, list }
  })
  .post('/videos', async (ctx) => {
    const { error, value } = await schema.validate(ctx.request.body)
    if (error) throw error
    ctx.body = await database('videos').insert(value)
  })
  .put('/videos/:id', async (ctx) => {
    const { error, value } = await schema.validate(ctx.request.body)
    if (error) throw error
    ctx.body = await database('videos')
      .where('id', ctx.params.id)
      .update(value)
  })
  .get('/videos/:id', async (ctx) => {
    const [row] = await database.select()
      .table('videos')
      .where('id', ctx.params.id)
    ctx.body = row
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
