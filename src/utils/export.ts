export async function exportTimelineImage(element: HTMLElement): Promise<void> {
  try {
    // Use html-to-image or similar library to capture the element
    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'chord-timeline.png';
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export timeline image:', error);
    throw new Error('Failed to export image');
  }
}

export function exportAnalysisData(analysis: any): void {
  try {
    const data = JSON.stringify(analysis, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'analysis-data.json';
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export analysis data:', error);
    throw new Error('Failed to export data');
  }
}

// Helper function to convert HTML element to canvas
async function html2canvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Failed to get canvas context');

  const rect = element.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Simple implementation - in production, use a proper html-to-canvas library
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  const svg = new XMLSerializer().serializeToString(element);
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svg);
  
  await new Promise((resolve) => {
    img.onload = resolve;
  });
  
  context.drawImage(img, 0, 0);
  return canvas;
}