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
            return reply.status(200).send({ uploadId: '123' })
        }
    )
}
