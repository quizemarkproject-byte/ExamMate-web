export function parseDurationToSeconds(value: string): number {
  if (!value) return 0;

  const regex =
    /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  const match = value.match(regex);

  if (!match) return 0;

  const weeks = parseInt(match[1] || '0', 10);
  const days = parseInt(match[2] || '0', 10);
  const hours = parseInt(match[3] || '0', 10);
  const minutes = parseInt(match[4] || '0', 10);
  const seconds = parseInt(match[5] || '0', 10);

  return (
    weeks * 7 * 24 * 3600 +
    days * 24 * 3600 +
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}

export function parseDurationToMinutes(value: string | number): number {
  if (!value) return 0;
  
  // If it's already a number, return it
  if (typeof value === 'number') return value;
  
  // If it's a plain number string, parse it
  const numValue = parseInt(value, 10);
  if (!isNaN(numValue) && String(numValue) === value) return numValue;
  
  // Parse ISO 8601 duration format (e.g., "PT10M")
  const regex =
    /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;
  const match = value.match(regex);

  if (!match) return 0;

  const weeks = parseInt(match[1] || '0', 10);
  const days = parseInt(match[2] || '0', 10);
  const hours = parseInt(match[3] || '0', 10);
  const minutes = parseInt(match[4] || '0', 10);

  // Convert everything to minutes
  return weeks * 7 * 24 * 60 + days * 24 * 60 + hours * 60 + minutes;
}
