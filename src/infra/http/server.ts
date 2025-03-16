import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'

const server = fastify({ logger: true })

server.register(fastifyCors, {
    origin: true,
})

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log('Server listening on port 3333.')
})
