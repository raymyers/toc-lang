import React from 'react';

interface FileControlsProps {
  onLoad: () => void;
  onSave: () => void;
}

export const FileControls: React.FC<FileControlsProps> = ({ onLoad, onSave }) => {
  return (
    <div className="file-controls">
      <button className='load' onClick={onLoad}>Load</button>
      <button className='save' onClick={onSave}>Save</button>
    </div>
  );
};

export default FileControls; 