import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const uploads = pgTable('uploads', {
    id: varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    name: text('name').notNull(),
    remoteKey: text('remote_key').notNull().unique(),
    remoteUrl: text('remote_url'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})
