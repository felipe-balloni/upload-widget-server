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
                body: z.object({
                    name: z.string(),
                }),
                response: {
                    200: z.object({ uploadId: z.string() }),
                    409: z
                        .object({ message: z.string() })
                        .describe('Upload already exists'),
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
