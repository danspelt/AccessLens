import { ImageResponse } from 'next/og';

export const alt = 'AccessLens: accessible places in Victoria and Vancouver, BC';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#ffffff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>AccessLens</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>
            Know before you go.
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.35, color: '#dbeafe', maxWidth: 960 }}>
            Community-sourced accessibility details for entrances, washrooms, parking and more.
          </div>
        </div>
        <div style={{ fontSize: 28, color: '#bfdbfe' }}>accesslens.ca · Victoria &amp; Vancouver, BC</div>
      </div>
    ),
    size
  );
}
