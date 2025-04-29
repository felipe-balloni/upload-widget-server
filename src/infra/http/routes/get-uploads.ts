import { getUploads } from '@/app/functions/get-uploads'
import { unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getUploadsRoute: FastifyPluginAsyncZod = async server => {
    server.get(
        '/uploads',
        {
            schema: {
                summary: 'Get a list of uploads',
                tags: ['Uploads'],
                querystring: z.object({
                    searchQuery: z.string().optional(),
                    sortBy: z.enum(['createdAt']).optional(),
                    sortDirection: z.enum(['asc', 'desc']).optional(),
                    page: z.coerce.number().optional(),
                    pageSize: z.coerce.number().optional(),
                }),
                responses: {
                    200: z.object({
                        uploads: z.array(
                            z.object({
                                id: z.string(),
                                name: z.string(),
                                remoteKey: z.string(),
                                remoteUrl: z.string(),
                                createdAt: z.date(),
                            })
                        ),
                        total: z.number(),
                    }),
                },
            },
        },
        async (req, res) => {
            const { searchQuery, sortBy, sortDirection, page, pageSize } =
                req.query

            const result = await getUploads({
                searchQuery,
                sortBy,
                sortDirection,
                page,
                pageSize,
            })

            const { total, uploads } = unwrapEither(result)

            return res.status(200).send({ total, uploads })
        }
    )
}
