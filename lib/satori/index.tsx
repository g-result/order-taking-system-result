// api.jsx
import satori from 'satori'
import React from 'react'

export const SvgData = async (data: string, fontData: Buffer) => {
  const svg = await satori(
    <div style={{ display: 'flex' }}>
      <h1>Sample</h1>
    </div>,
    {
      width: 600,
      height: 400,
      fonts: [
        {
          name: 'Roboto',
          data: fontData,
          weight: 400,
          style: 'normal'
        }
      ]
    }
  )

  return svg
}
