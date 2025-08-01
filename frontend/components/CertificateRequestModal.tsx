import React from 'react';
interface CertificateRequestModalProps { isOpen: boolean; onClose: () => void; onCertificateRequested: () => void; }
const CertificateRequestModal: React.FC<CertificateRequestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-card p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-bold mb-4">Request New Certificate</h2>
        <p>Certificate request form will be here.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded">Close</button>
      </div>
    </div>
  );
};
export default CertificateRequestModal;
