import { promises as fs } from 'node:fs'

import { join } from 'path'

import { Video } from '@/core/domain/video-processing/entities/video'
import { FrameExtractorPort } from '@/core/domain/video-processing/ports/frame-extractor-port'
import { VideoInformation } from '@/core/domain/video-processing/value-objects/video-information'
import { VideoStatus } from '@/core/domain/video-processing/value-objects/video-status'

import { StoragePort } from '../../storage/ports/storage-port'
import { DirectoryService } from '../services/directory-service'

export class ExtractFramesUseCase {
  constructor(
    private readonly frameExtractor: FrameExtractorPort,
    private readonly storage: StoragePort,
  ) {}

  async execute(
    storagePath: string,
    outputFolder: string,
    interval: number,
    imageSize: string,
    startTime: number,
    endTime: number | null,
  ): Promise<void> {
    const videoFile = await this.storage.retrieve(storagePath)

    const filename = storagePath.split('/').pop() as string
    const localVideoPath = `/tmp/${storagePath}`

    DirectoryService.ensureDirectoryExists(outputFolder)
    DirectoryService.ensureDirectoryExists(localVideoPath.split('.')[0])

    await fs.writeFile(localVideoPath, videoFile)

    const videoDuration =
      await this.frameExtractor.getVideoDuration(localVideoPath)

    const info = VideoInformation.create(
      localVideoPath,
      filename,
      videoDuration,
    )
    const video = new Video(info, VideoStatus.PROCESSING)

    await this.frameExtractor.extractFrames(
      video,
      interval,
      outputFolder,
      imageSize,
      startTime,
      endTime,
    )

    console.log('Output folder', outputFolder)
    const frames = await fs.readdir(outputFolder)

    await Promise.all([
      frames.map(async (frame) => {
        const framePath = join(outputFolder, frame)
        const frameContent = await fs.readFile(framePath)
        await this.storage.store(framePath.replace('/tmp/', ''), frameContent)
      }),
    ])

    // await this.zipCreator.createZip(outputFolder, zipFilePath)
  }
}
