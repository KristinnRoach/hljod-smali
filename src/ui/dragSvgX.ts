/** Report horizontal drag positions in the owning SVG's coordinates. */
export function dragSvgX(event: PointerEvent, start: number, onChange: (x: number) => void) {
  const target = event.currentTarget as SVGGraphicsElement;
  const inverse = target.ownerSVGElement!.getScreenCTM()!.inverse();
  const pointerX = (e: PointerEvent) =>
    new DOMPoint(e.clientX, e.clientY).matrixTransform(inverse).x;
  const origin = pointerX(event);
  event.preventDefault();
  event.stopPropagation();
  target.setPointerCapture(event.pointerId);
  const move = (e: PointerEvent) => onChange(start + pointerX(e) - origin);
  const stop = () => {
    target.removeEventListener('pointermove', move);
    target.removeEventListener('lostpointercapture', stop);
  };
  target.addEventListener('pointermove', move);
  target.addEventListener('lostpointercapture', stop);
}
