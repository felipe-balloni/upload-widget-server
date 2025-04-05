import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { InvalidFileFormat } from '@/app/functions/errors/invalid-file-format'
import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it, vi } from 'vitest'

describe('UploadImage', () => {
    beforeAll(() => {
        vi.mock('@/infra/storage/upload-file-to-storage', () => {
            return {
                uploadFileToStorage: vi.fn().mockImplementation(() => {
                    return {
                        key: `${randomUUID()}.jpg`,
                        url: 'https://storage.test/image.jpg',
                    }
                }),
            }
        })
    })

    it('should be able to upload and image', async () => {
        const fileNane = `${randomUUID()}.jpg`

        const sut = await uploadImage({
            fileName: fileNane,
            contentType: 'image/jpg',
            contentStream: Readable.from([]),
        })

        expect(isRight(sut)).toBe(true)

        const result = await db
            .select()
            .from(schema.uploads)
            .where(eq(schema.uploads.name, fileNane))

        console.log(result)

        expect(result).toHaveLength(1)
    })

    it('should not be able to upload an invalid file', async () => {
        const fileNane = `${randomUUID()}.jpg`

        const sut = await uploadImage({
            fileName: fileNane,
            contentType: 'document/pdf',
            contentStream: Readable.from([]),
        })

        expect(isLeft(sut)).toBe(true)

        expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat)
    })
})
