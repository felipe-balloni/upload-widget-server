import { z } from 'zod'

const envSchema = z.object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('production'),
    DATABASE_URL: z.string().url().startsWith('postgresql://'),

    CLOUDFLARE_R2_ACCOUNT_ID: z.string(),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
    CLOUDFLARE_R2_BUCKET: z.string(),
    CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
