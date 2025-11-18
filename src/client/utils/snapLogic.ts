export const isWithinTolerance = (
  dropPosition: { row: number; col: number },
  correctPosition: { row: number; col: number },
  tolerance: number = 0
): boolean => {
  return (
    Math.abs(dropPosition.row - correctPosition.row) <= tolerance &&
    Math.abs(dropPosition.col - correctPosition.col) <= tolerance
  );
};

export const getDropZonePosition = (
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  gridSize: number
): { row: number; col: number } | null => {
  if (
    clientX < canvasRect.left ||
    clientX > canvasRect.right ||
    clientY < canvasRect.top ||
    clientY > canvasRect.bottom
  ) {
    return null;
  }

  const relativeX = clientX - canvasRect.left;
  const relativeY = clientY - canvasRect.top;

  const pieceWidth = canvasRect.width / gridSize;
  const pieceHeight = canvasRect.height / gridSize;

  const col = Math.floor(relativeX / pieceWidth);
  const row = Math.floor(relativeY / pieceHeight);

  return { row, col };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
