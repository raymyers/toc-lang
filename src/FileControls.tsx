import React from 'react'

interface FileControlsProps {
  onLoad: () => void;
  onSave: () => void;
  onSelectExample: (vale: string) => void;
}

export const FileControls: React.FC<FileControlsProps> = ({ onLoad, onSave, onSelectExample }) => {
  return (
    <div className="file-controls">
      <button className='load' onClick={onLoad}>Load</button>
      <button className='save' onClick={onSave}>Save</button>
      <select onChange={(e) => { onSelectExample(e.target.value) }}>
        <option value="">Examples</option>
        <option value="goal">Goal Tree</option>
        <option value="problem">Problem Tree</option>
        <option value="conflict">Conflict Cloud</option>
      </select>
    </div>
  )
}

export default FileControls
