import React, { useState, useRef, useCallback } from 'react';
import { Table, TableStatus, TableShape } from '../types/table.types';
import TableComponent from './Table';

interface FloorPlanEditorProps {
  tables: Table[];
  onTableMove: (tableId: string, x: number, y: number) => void;
  onTableClick: (table: Table) => void;
  onTableCreate: (x: number, y: number) => void;
  editorMode?: 'view' | 'edit';
  width?: number;
  height?: number;
}

export const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  tables,
  onTableMove,
  onTableClick,
  onTableCreate,
  editorMode = 'view',
  width = 1200,
  height = 800,
}) => {
  const [draggingTable, setDraggingTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTableMouseDown = useCallback(
    (tableId: string, event: React.MouseEvent) => {
      if (editorMode !== 'edit') return;
      
      event.preventDefault();
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;

      const rect = event.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setDraggingTable(tableId);
    },
    [editorMode, tables]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!draggingTable || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left - dragOffset.x;
      const y = event.clientY - rect.top - dragOffset.y;

      // Constrain within bounds
      const table = tables.find((t) => t.id === draggingTable);
      if (!table) return;

      const constrainedX = Math.max(0, Math.min(x, width - table.width));
      const constrainedY = Math.max(0, Math.min(y, height - table.height));

      // Update position in real-time (optimistic update)
      onTableMove(draggingTable, constrainedX, constrainedY);
    },
    [draggingTable, dragOffset, tables, width, height, onTableMove]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingTable(null);
  }, []);

  const handleFloorPlanClick = useCallback(
    (event: React.MouseEvent) => {
      if (editorMode !== 'edit' || draggingTable) return;

      // Check if clicking on empty space (not a table)
      if (event.target === containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onTableCreate(x, y);
      }
    },
    [editorMode, draggingTable, onTableCreate]
  );

  return (
    <div className="floor-plan-container">
      <div
        ref={containerRef}
        className="floor-plan-canvas"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          border: '2px solid #ddd',
          backgroundColor: '#f9fafb',
          cursor: editorMode === 'edit' ? 'crosshair' : 'default',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleFloorPlanClick}
      >
        {/* Grid lines for alignment */}
        {editorMode === 'edit' && (
          <svg
            width={width}
            height={height}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        )}

        {/* Render all tables */}
        {tables.map((table) => (
          <TableComponent
            key={table.id}
            table={table}
            isDragging={draggingTable === table.id}
            onMouseDown={(e) => handleTableMouseDown(table.id, e)}
            onClick={() => onTableClick(table)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="floor-plan-legend" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
          Table Status Legend
        </h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <StatusIndicator status="AVAILABLE" label="Available" />
          <StatusIndicator status="OCCUPIED" label="Occupied" />
          <StatusIndicator status="RESERVED" label="Reserved" />
          <StatusIndicator status="DIRTY" label="Dirty" />
          <StatusIndicator status="CLEANING" label="Cleaning" />
        </div>
      </div>
    </div>
  );
};

const StatusIndicator: React.FC<{ status: TableStatus; label: string }> = ({
  status,
  label,
}) => {
  const colors = {
    AVAILABLE: '#10b981',
    OCCUPIED: '#ef4444',
    RESERVED: '#3b82f6',
    DIRTY: '#f59e0b',
    CLEANING: '#8b5cf6',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: colors[status],
          borderRadius: '4px',
          border: '1px solid #ddd',
        }}
      />
      <span style={{ fontSize: '14px' }}>{label}</span>
    </div>
  );
};

export default FloorPlanEditor;
