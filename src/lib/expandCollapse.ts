const toggleRow = (root: Element, rowNumber: number) => {
  const rowSelectors = [
    '.env-group, .sample-group, .space-group',
    '.filter-group,  .feedback-group',
    '.loop-group, .trim-group, .misc-group, .amp-lfo-group, .pitch-lfo-group',
    '.toggle-group, .keyboard-group',
  ];

  const selector = rowSelectors[rowNumber - 1];
  if (!selector) return;
  const groups = root.querySelectorAll(selector);

  if (groups.length === 0) return;
  const allCollapsed = Array.from(groups).every((g) => g.classList.contains('collapsed'));

  groups.forEach((group) => group.classList.toggle('collapsed', !allCollapsed));
};

export const handleExpandCollapseClick = (root: Element, target: EventTarget | null) => {
  if (!(target instanceof Element)) return;

  const legend = target.closest('.expandable-legend');
  if (legend) {
    legend.closest('.control-group')?.classList.toggle('collapsed');
  }

  const rowIcon = target.closest('.row-collapse-icon');
  if (rowIcon) {
    const row = Number.parseInt(rowIcon.getAttribute('data-row') ?? '', 10);
    if (Number.isFinite(row) && row > 0) {
      toggleRow(root, row);
    }
  }
};
