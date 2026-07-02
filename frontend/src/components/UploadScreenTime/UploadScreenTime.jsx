import React, { useState, useRef } from 'react';
import { screenTimeApi } from '../../apis/customerApi';
import toast from 'react-hot-toast';
import './UploadScreenTime.css';

export default function UploadScreenTime({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh (PNG, JPG, JPEG).');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorMsg('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh (PNG, JPG, JPEG).');
        return;
      }
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setErrorMsg('');
    }
  };

  const handleReset = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    const loadingToastId = toast.loading('Đang phân tích ảnh chụp màn hình bằng AI...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await screenTimeApi.uploadScreenTime(formData);
      
      // Axios request resolves. Check response format
      // Response format: { screenTimeMinutes: 272, captureDate: "2026-06-08" }
      const data = response.data;
      if (data && typeof data.screenTimeMinutes === 'number') {
        toast.success(
          `Nhận diện thành công: ${data.screenTimeMinutes} phút sử dụng điện thoại!`,
          { id: loadingToastId }
        );
        onSuccess(data.screenTimeMinutes);
        handleReset();
      } else {
        throw new Error('Dữ liệu trả về không hợp lệ.');
      }
    } catch (err) {
      console.error('OCR Upload error:', err);
      let errMsg = 'Không thể phân tích ảnh chụp màn hình. Vui lòng thử lại.';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errMsg = err.response.data;
        } else if (err.response.data.message) {
          errMsg = err.response.data.message;
        }
      }
      
      setErrorMsg(errMsg);
      toast.error('Phân tích ảnh thất bại!', { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ust-container ${isDragActive ? 'active-drag' : ''}`}>
      <div className="ust-header">
        <span className="ust-icon">📸</span>
        <span>Tự động nhập từ ảnh chụp</span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={loading}
      />

      {!file ? (
        <div
          className="ust-dropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="ust-dropzone-icon">📱</div>
          <div className="ust-dropzone-text">Chọn hoặc thả ảnh chụp màn hình vào đây</div>
          <div className="ust-dropzone-subtext">Hỗ trợ các định dạng thời gian: 4h 32m, 4:32, 4 giờ 32 phút...</div>
        </div>
      ) : (
        <div className="ust-preview-container">
          <div className="ust-preview-wrapper">
            <img src={previewUrl} alt="Preview" className="ust-preview-image" />
          </div>
          <div className="ust-preview-info">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </div>

          <div className="ust-btn-group">
            <button
              className="ust-btn ust-btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Chọn ảnh khác
            </button>
            <button
              className="ust-btn ust-btn-primary"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ust-spinner" />
                  Đang xử lý...
                </>
              ) : (
                '🔍 Phân tích ảnh'
              )}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="ust-status-box ust-status-loading">
          <span className="ust-spinner" />
          <div>
            <strong>Đang xử lý ảnh qua công nghệ OCR...</strong>
            <p style={{ margin: '2px 0 0', opacity: 0.8, fontSize: '0.72rem' }}>
              Hệ thống đang tải thư viện, trích xuất văn bản và khớp mẫu thời gian. Vui lòng đợi trong giây lát.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="ust-status-box ust-status-error">
          <span style={{ fontSize: '1.1rem' }}>❌</span>
          <div>
            <strong>Lỗi nhận diện:</strong>
            <p style={{ margin: '2px 0 0', opacity: 0.9 }}>{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
