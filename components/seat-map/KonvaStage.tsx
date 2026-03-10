'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Circle, Rect, Text, Group } from 'react-konva';
import { SeatInventory, Section } from '@/types';
import Konva from 'konva';

const STATUS_COLORS: Record<string, { fill: string; stroke: string }> = {
  available: { fill: 'rgba(34,197,94,0.30)', stroke: '#22C55E' },
  locked:    { fill: 'rgba(245,158,11,0.30)', stroke: '#F59E0B' },
  sold:      { fill: 'rgba(239,68,68,0.30)', stroke: '#EF4444' },
  selected:  { fill: '#8B5CF6', stroke: '#A78BFA' },
  accessible:{ fill: 'rgba(6,182,212,0.30)', stroke: '#06B6D4' },
  blocked:   { fill: 'rgba(113,113,122,0.20)', stroke: '#71717A' },
  reserved:  { fill: 'rgba(113,113,122,0.20)', stroke: '#71717A' },
};

interface KonvaStageProps {
  inventory: SeatInventory[];
  seatStatuses: Record<string, string>;
  selectedSeatIds: Set<string>;
  sections: Section[];
  accessibilityMode: boolean;
  scale: number;
  onScaleChange: (scale: number) => void;
  onSeatClick: (seatId: string, seatData: { seat_id: string; row_label: string; seat_number: string; seat_type: string; section_id: string }) => void;
}

export default function KonvaStage({
  inventory,
  seatStatuses,
  selectedSeatIds,
  sections,
  accessibilityMode,
  scale,
  onScaleChange,
  onSeatClick,
}: KonvaStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);

  const getStageSize = () => ({
    width: containerRef.current?.offsetWidth || 800,
    height: containerRef.current?.offsetHeight || 600,
  });

  // Filter inventory to those with position data
  const seatsWithPos = inventory.filter(inv => inv.seats && inv.seats.x_pos != null && inv.seats.y_pos != null);

  // If no positioned seats, generate a simple grid layout
  const generateGridSeats = () => {
    if (seatsWithPos.length > 0) return seatsWithPos;

    // Group by section and create a grid
    const bySectionGroup: Record<string, SeatInventory[]> = {};
    inventory.forEach(inv => {
      if (!inv.seats) return;
      const sid = inv.seats.section_id;
      if (!bySectionGroup[sid]) bySectionGroup[sid] = [];
      bySectionGroup[sid].push(inv);
    });

    const SEAT_RADIUS = 8;
    const SEAT_SPACING = 22;
    const SECTION_PADDING = 60;
    let sectionOffsetX = 80;

    const result: (SeatInventory & { generatedX: number; generatedY: number })[] = [];
    Object.entries(bySectionGroup).forEach(([, sectionSeats]) => {
      // Group by row
      const byRow: Record<string, SeatInventory[]> = {};
      sectionSeats.forEach(s => {
        const row = s.seats!.row_label;
        if (!byRow[row]) byRow[row] = [];
        byRow[row].push(s);
      });

      const rows = Object.keys(byRow).sort();
      const maxCols = Math.max(...rows.map(r => byRow[r].length));

      rows.forEach((row, rowIdx) => {
        byRow[row].forEach((seat, colIdx) => {
          result.push({
            ...seat,
            generatedX: sectionOffsetX + colIdx * SEAT_SPACING,
            generatedY: 80 + rowIdx * SEAT_SPACING,
          });
        });
      });

      sectionOffsetX += maxCols * SEAT_SPACING + SECTION_PADDING;
    });

    return result;
  };

  const displaySeats = generateGridSeats() as (SeatInventory & { generatedX?: number; generatedY?: number })[];

  const getSeatColor = (inv: SeatInventory) => {
    if (!inv.seats) return STATUS_COLORS.blocked;
    if (selectedSeatIds.has(inv.seat_id)) return STATUS_COLORS.selected;

    const status = seatStatuses[inv.seat_id] || inv.status;
    const seatType = inv.seats.seat_type;

    if (accessibilityMode) {
      if (seatType === 'accessible') return STATUS_COLORS.accessible;
      if (status === 'available') return { fill: 'rgba(34,197,94,0.10)', stroke: 'rgba(34,197,94,0.30)' };
    }

    if (seatType === 'accessible' && status === 'available') return STATUS_COLORS.accessible;
    return STATUS_COLORS[status] || STATUS_COLORS.blocked;
  };

  // Handle wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = Math.max(0.3, Math.min(4, oldScale * (1 + direction * 0.1)));
    onScaleChange(newScale);

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Stage
        ref={stageRef}
        width={getStageSize().width}
        height={getStageSize().height}
        draggable
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
      >
        <Layer>
          {displaySeats.map(inv => {
            if (!inv.seats) return null;
            const x = inv.seats.x_pos != null ? Number(inv.seats.x_pos) : (inv as typeof inv & { generatedX?: number }).generatedX ?? 0;
            const y = inv.seats.y_pos != null ? Number(inv.seats.y_pos) : (inv as typeof inv & { generatedY?: number }).generatedY ?? 0;
            const colors = getSeatColor(inv);
            const isClickable = selectedSeatIds.has(inv.seat_id) || (seatStatuses[inv.seat_id] || inv.status) === 'available';

            return (
              <Circle
                key={inv.inventory_id}
                x={x}
                y={y}
                radius={8}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={2}
                cursor={isClickable ? 'pointer' : 'not-allowed'}
                onClick={() => {
                  if (!inv.seats) return;
                  onSeatClick(inv.seat_id, {
                    seat_id: inv.seats.seat_id,
                    row_label: inv.seats.row_label,
                    seat_number: inv.seats.seat_number,
                    seat_type: inv.seats.seat_type,
                    section_id: inv.seats.section_id,
                  });
                }}
                onMouseEnter={e => {
                  if (isClickable) {
                    (e.target as Konva.Circle).to({ scaleX: 1.3, scaleY: 1.3, duration: 0.1 });
                  }
                }}
                onMouseLeave={e => {
                  (e.target as Konva.Circle).to({ scaleX: 1, scaleY: 1, duration: 0.1 });
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
