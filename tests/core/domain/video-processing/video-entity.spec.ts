import { describe, expect, it } from 'vitest'

import { Video } from '@/core/domain/video-processing/entities/video'
import { VideoInformation } from '@/core/domain/video-processing/value-objects/video-information'

describe('Video Entity', () => {
  it('should create a valid Video instance', () => {
    const info = VideoInformation.create('/path/to/video.mp4', 120)
    const video = new Video(info)

    expect(video.info.path).toBe('/path/to/video.mp4')
    expect(video.info.duration).toBe(120)
  })

  it('should throw an error if duration is negative', () => {
    expect(() => {
      const info = VideoInformation.create('/path/to/video.mp4', -10)

      return new Video(info)
    }).toThrowError('Invalid video duration')
  })
})
