import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { validate as validateUUID } from 'uuid'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

function isUUIDv7(uuid: string): boolean {
    // Verifica se é um UUID válido
    if (!validateUUID(uuid)) return false

    // Verifica se é versão 7 (bits 48-51 devem ser 0111)
    const version = Number.parseInt(uuid[14], 16)
    return version === 7
}

function getTimestampFromUUID(uuid: string): Date {
    // Pega os primeiros 12 caracteres do UUID (48 bits de timestamp)
    const hex = uuid.replace(/-/g, '').slice(0, 12)
    const timestampMs = Number.parseInt(hex, 16)

    return new Date(timestampMs)
}

describe('Uploads Schema', () => {
    beforeAll(async () => {
        try {
            // Executa as migrações
            await migrate(drizzle(pg), {
                migrationsFolder: 'src/infra/db/migrations',
            })
        } catch (error) {
            // Se o erro for porque as migrações já foram aplicadas, podemos ignorar
            if (
                !(error instanceof Error) ||
                !error.message.includes('already applied')
            ) {
                throw error
            }
        }
    })

    afterAll(async () => {
        // Fecha a conexão com o banco de dados
        await pg.end()
    })

    beforeEach(async () => {
        // Limpa a tabela antes de cada teste
        await db.delete(schema.uploads)
    })

    it('should create a record with UUID v7 and correct fields', async () => {
        const testData = {
            name: 'test-file.txt',
            remoteKey: 'test-key-123',
            remoteUrl: 'https://example.com/test-file.txt',
        }

        const [createdRecord] = await db
            .insert(schema.uploads)
            .values(testData)
            .returning()

        // Verifica se o ID é um UUID v7 válido
        expect(isUUIDv7(createdRecord.id)).toBe(true)

        // Verifica se o timestamp do UUID está próximo do timestamp atual
        const uuidTimestamp = getTimestampFromUUID(createdRecord.id)
        const now = new Date()
        const diffInMinutes =
            Math.abs(now.getTime() - uuidTimestamp.getTime()) / (1000 * 60)
        expect(diffInMinutes).toBeLessThan(5) // Tolerância de 5 minutos

        // Verifica se os campos foram criados corretamente
        expect(createdRecord.name).toBe(testData.name)
        expect(createdRecord.remoteKey).toBe(testData.remoteKey)
        expect(createdRecord.remoteUrl).toBe(testData.remoteUrl)
        expect(createdRecord.createdAt).toBeInstanceOf(Date)
    })

    it('should fail when trying to create a record with duplicate remoteKey', async () => {
        const testData = {
            name: 'test-file.txt',
            remoteKey: 'test-key-123',
            remoteUrl: 'https://example.com/test-file.txt',
        }

        // Primeira inserção
        await db.insert(schema.uploads).values(testData)

        // Segunda inserção com mesma remoteKey deve falhar
        await expect(
            db.insert(schema.uploads).values(testData)
        ).rejects.toThrow()
    })

    it('should create a record without remoteUrl', async () => {
        const testData = {
            name: 'test-file.txt',
            remoteKey: 'test-key-123',
        }

        const [createdRecord] = await db
            .insert(schema.uploads)
            .values(testData)
            .returning()

        expect(createdRecord.remoteUrl).toBeNull()
    })
})
