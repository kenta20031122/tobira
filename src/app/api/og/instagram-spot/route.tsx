import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const W = 1080
const H = 1440

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const img = searchParams.get('img') ?? ''
  const name = searchParams.get('name') ?? ''
  const prefecture = searchParams.get('prefecture') ?? ''
  const highlight = searchParams.get('highlight') ?? ''
  const index = searchParams.get('index') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background: '#0f172a',
        }}
      >
        {/* Background photo */}
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: W,
              height: H,
              objectFit: 'cover',
            }}
          />
        )}

        {/* Gradient overlay — dark at bottom */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: W,
            height: H,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.92) 100%)',
          }}
        />

        {/* Slide number badge */}
        {index && (
          <div
            style={{
              position: 'absolute',
              top: '48px',
              right: '56px',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {index}
          </div>
        )}

        {/* Bottom content */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: W,
            padding: '56px 64px 64px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Prefecture */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '30px',
              color: 'rgba(255,255,255,0.75)',
              letterSpacing: '0.05em',
            }}
          >
            <span>📍</span>
            <span>{prefecture}</span>
          </div>

          {/* Spot name */}
          <div
            style={{
              fontSize: name.length > 20 ? '62px' : '72px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {name}
          </div>

          {/* Highlight */}
          {highlight && (
            <div
              style={{
                fontSize: '28px',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.5,
                borderLeft: '3px solid #dc2626',
                paddingLeft: '20px',
              }}
            >
              {highlight.length > 80 ? highlight.slice(0, 80) + '…' : highlight}
            </div>
          )}

          {/* TOBIRA mark */}
          <div
            style={{
              marginTop: '8px',
              fontSize: '22px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.2em',
            }}
          >
            TOBIRA
          </div>
        </div>
      </div>
    ),
    { width: W, height: H }
  )
}
