import { env } from '@/env'
import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'

const server = fastify({ logger: true })

server.register(fastifyCors, {
    origin: true,
})

console.log(env.DATABASE_URL)

server.listen({ port: 3333, host: '127.0.0.1' }).then(() => {
    console.log('Server listening on port 3333.')
})
