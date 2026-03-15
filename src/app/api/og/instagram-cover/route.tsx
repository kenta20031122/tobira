import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const W = 1080
const H = 1350

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'Japan Beyond Tokyo'
  const bg = searchParams.get('bg') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background photo */}
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bg}
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

        {/* Dark gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: W,
            height: H,
            background: bg
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.85) 100%)'
              : 'linear-gradient(160deg, #0f172a 0%, #1a0a0a 50%, #0f172a 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            width: '100%',
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: '34px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              opacity: 0.9,
            }}
          >
            TOBIRA
          </div>

          {/* Red underline */}
          <div
            style={{
              width: '60px',
              height: '3px',
              background: '#dc2626',
              borderRadius: '2px',
              marginBottom: '56px',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 40 ? '68px' : '80px',
              fontWeight: 800,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.2,
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: W,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 72px',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontSize: '28px', color: '#ffffff', opacity: 0.8, letterSpacing: '0.05em' }}>
            Japan Beyond Tokyo
          </div>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#dc2626',
            }}
          />
          <div style={{ fontSize: '28px', color: '#ffffff', opacity: 0.8 }}>
            @tobira_japan_beyond_tokyo
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
    }
  )
}
