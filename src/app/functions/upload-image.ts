import { Readable } from 'node:stream'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { z } from 'zod'
import { InvalidFileFormat } from './errors/invalid-file-format'

const uploadImageInput = z.object({
    fileName: z.string(),
    contentType: z.string(),
    contentLength: z.instanceof(Readable),
})

type UploadImageInput = z.infer<typeof uploadImageInput>

const allowedContentTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
]

export async function uploadImage(
    input: UploadImageInput
): Promise<Either<InvalidFileFormat, { url: string }>> {
    const { fileName, contentType, contentLength } =
        uploadImageInput.parse(input)

    if (!allowedContentTypes.includes(contentType)) {
        return makeLeft(new InvalidFileFormat())
    }

    // carregar a imagem para cloudFlare R2

    await db.insert(schema.uploads).values({
        name: fileName,
        remoteKey: fileName,
        remoteUrl: fileName,
    })

    return makeRight({ url: fileName })
}
