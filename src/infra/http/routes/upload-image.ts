import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
    server.post(
        '/uploads',
        {
            schema: {
                summary: 'Upload an image',

                consumes: ['multipart/form-data'],
                response: {
                    200: z.object({ uploadId: z.string() }),
                },
                tags: ['Uploads'],
            },
        },
        async (request, reply) => {
            await db.insert(schema.uploads).values({
                name: 'teste.jpg',
                remoteKey: 'teste.jpg',
                remoteUrl: 'https://teste.jpg',
            })

            return reply.status(200).send({ uploadId: '123' })
        }
    )
}
