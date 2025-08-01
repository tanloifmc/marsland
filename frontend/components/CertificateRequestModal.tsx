'use client'
import React from 'react';
import { Button } from './ui/button'; // Import Button để sử dụng

// Sửa lại interface để khớp với cách dùng
interface CertificateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Đổi tên thành onSuccess
}

const CertificateRequestModal: React.FC<CertificateRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  // Hàm xử lý khi request thành công (giả lập)
  const handleSuccess = () => {
    // Trong một ứng dụng thật, đây là nơi bạn sẽ gọi API để tạo request
    // Sau khi thành công, gọi hàm onSuccess được truyền từ cha
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">Request New Certificate</h2>
        <div className="space-y-4">
          {/* Đây là form giữ chỗ */}
          <p className="text-sm text-muted-foreground">
            The form to request a new land certificate will be displayed here.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSuccess}>Submit Request</Button>
        </div>
      </div>
    </div>
  );
};

export default CertificateRequestModal;
