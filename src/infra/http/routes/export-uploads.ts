import { exportUploads } from '@/app/functions/export-uploads'
import { unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const exportUploadsRoute: FastifyPluginAsyncZod = async server => {
    server.get(
        '/uploads/export',
        {
            schema: {
                summary: 'Get a list of uploads',
                tags: ['Uploads'],
                querystring: z.object({
                    searchQuery: z.string().optional(),
                }),
                responses: {
                    200: z.object({
                        reportUrl: z.string(),
                    }),
                },
            },
        },
        async (req, res) => {
            const { searchQuery } = req.query

            const result = await exportUploads({
                searchQuery,
            })

            const { reportUrl } = unwrapEither(result)

            return res.status(200).send({ reportUrl })
        }
    )
}
