import { uploadImageRoute } from '@/infra/http/routes/upload-image'
import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
    hasZodFastifySchemaValidationErrors,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'
import { transformSwaggerSchema } from './transform-swager-schema'

const server = fastify({ logger: true })

server.setSerializerCompiler(serializerCompiler)
server.setValidatorCompiler(validatorCompiler)

server.setErrorHandler((error, request, reply) => {
    // Validation errors
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: 'Validation errors. Please check the request body',
            issues: error.validation,
        })
    }

    // Send to an observability tool, like Sentry, etc.
    console.log(error)

    reply.status(500).send({ message: 'Internal server error' })
})

server.register(fastifyCors, { origin: '*' })
server.register(fastifyMultipart)
server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Upload Server',
            version: '1.0.0',
        },
    },
    transform: transformSwaggerSchema,
})
server.register(fastifySwaggerUi, { routePrefix: '/docs' })

server.register(uploadImageRoute)

server.listen({ port: 3333, host: '127.0.0.1' }).then(() => {
    console.log('Server listening on port 3333.')
})
