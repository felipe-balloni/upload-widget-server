import { env } from '@/env'
import { uploadImageRoute } from '@/infra/http/routes/upload-image'
import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
    hasZodFastifySchemaValidationErrors,
    serializerCompiler,
    validatorCompiler,
} from 'fastify-type-provider-zod'

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

server.register(fastifyCors, {
    origin: true,
})

server.register(uploadImageRoute)

server.listen({ port: 3333, host: '127.0.0.1' }).then(() => {
    console.log('Server listening on port 3333.')
})
