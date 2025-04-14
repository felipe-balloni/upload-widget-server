import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { fa, fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export async function makeUploads(
    overrides?: Partial<InferInsertModel<typeof schema.uploads>>
) {
    const filmeName = faker.system.fileName()

    const results = await db
        .insert(schema.uploads)
        .values({
            name: filmeName,
            remoteKey: `images/${filmeName}`,
            remoteUrl: new URL(
                `/images/${filmeName}`,
                faker.internet.url()
            ).toString(),
            ...overrides,
        })
        .returning()

    return results[0]
}
