import { PrismaClient } from '@prisma/client'

import { ProcessVideoUseCase } from './core/application/video-processing/use-cases/process-video-use-case'
import { getVideoInput } from './infra/adapter/input/cli/video-input'
import { FrameExtractorFfmpeg } from './infra/adapter/output/external-services/frame-extractor-ffmpeg'
import { ZipCreatorArchiver } from './infra/adapter/output/persistence/zip-creator-archiver'
import { VideoPrismaRepository } from './infra/adapter/output/repositories/prisma/video-prisma-repository'
;(async () => {
  console.log('Process started...')

  try {
    const prisma = new PrismaClient()

    const { videoPath, startTime, endTime } = await getVideoInput()

    const frameExtractor = new FrameExtractorFfmpeg()
    const zipCreator = new ZipCreatorArchiver()
    const videoRepository = new VideoPrismaRepository(prisma)

    const useCase = new ProcessVideoUseCase(
      frameExtractor,
      zipCreator,
      videoRepository,
    )

    await useCase.execute({
      filename: videoPath.split('/').pop() as string,
      intervalInSecondsToExtractFrames: 20,
      imageSize: '1920x1080',
      secondsStartExtractingFrames: startTime,
      secondsEndExtractingFrames: endTime,
    })

    console.log('Process completed successfully')
  } catch (error) {
    console.error('An error occurred during the process:', error)
  }
})()
