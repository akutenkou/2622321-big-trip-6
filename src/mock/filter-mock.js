export const generateFilters = (hasPoints) => [
  { name: 'everything', isDisabled: false, isChecked: true },
  { name: 'future', isDisabled: !hasPoints, isChecked: false },
  { name: 'present', isDisabled: !hasPoints, isChecked: false },
  { name: 'past', isDisabled: !hasPoints, isChecked: false }
];
