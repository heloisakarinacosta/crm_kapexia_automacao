import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: number | string;
  height?: number | string; // NOVO
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title, width = '90vw', height = '90vh' }) => {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000,
      background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.2s',
    }} onClick={onClose}>
      <div
        style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px #0002', padding: 0,
          minWidth: 320, width, maxWidth: '98vw', minHeight: 200, height, maxHeight: '98vh', overflow: 'auto',
          animation: 'modalIn 0.18s', position: 'relative',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div style={{ padding: '20px 28px 0 28px', fontWeight: 700, fontSize: 22, color: '#222' }}>{title}</div>
        )}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', fontSize: 28, color: '#888', cursor: 'pointer' }}
          aria-label="Fechar"
        >×</button>
        <div style={{ flex: 1, padding: '24px 28px 28px 28px', color: '#222', fontSize: 16 }}>{children}</div>
      </div>
      <style>{`
        @keyframes modalIn {
          from { transform: translateY(40px) scale(0.98); opacity: 0; }
          to { transform: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal; 