import { useAWSaaSContext } from '../context/AWSaaSContext';

const PRODUCTS = [
  { id: 1, name: "ProBook Ultra", price: 1299, desc: "M3 chip, 16GB RAM", rating: 4.8 },
  { id: 2, name: "SoundPods Pro", price: 249, desc: "ANC, 30hr battery", rating: 4.7 },
  { id: 3, name: "SmartWatch X", price: 399, desc: "Health tracking, GPS", rating: 4.6 },
  { id: 4, name: "MechaKeys 75%", price: 159, desc: "Hot-swap, RGB backlit", rating: 4.9 },
  { id: 5, name: "StreamCam 4K", price: 199, desc: "HDR, auto-focus ring", rating: 4.5 },
  { id: 6, name: "DeskPad XL", price: 49, desc: "900×400mm, stitched edges", rating: 4.8 },
];

const STYLES = {
  SMALL: { filter: 'blur(2px)', opacity: 0.8 },
  MEDIUM: { filter: 'blur(0.5px)' },
  LARGE: {}
} as const;

export const ProductGrid = () => {
  const { strategy } = useAWSaaSContext();
  const currentStrategy = (strategy?.strategy || "LARGE") as keyof typeof STYLES;

  const imageStyle = STYLES[currentStrategy] || STYLES.LARGE;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {PRODUCTS.map(p => (
        <div key={p.id} style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ height: '200px', background: '#f1f5f9', overflow: 'hidden' }}>
            <img 
              src="/assets/bombdevil.jpg" 
              alt={p.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', ...imageStyle }} 
            />
          </div>
          <div style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem' }}>{p.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1rem' }}>{p.desc} · ⭐ {p.rating}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${p.price}</span>
              <button style={{
                background: '#0f172a',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                Buy
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
