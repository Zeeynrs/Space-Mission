export function formatMass(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t (${kg.toLocaleString()} kg)`;
  }
  return `${kg.toLocaleString()} kg`;
}

export function formatCost(costM: number): string {
  return `$${costM.toFixed(1)}M`;
}

export function formatPower(watts: number): string {
  const sign = watts > 0 ? '+' : '';
  return `${sign}${Math.round(watts)} W`;
}

export function formatEnergy(wh: number): string {
  return `${Math.round(wh)} Wh`;
}

export function formatDeltaV(ms: number): string {
  return `${ms.toLocaleString()} m/s`;
}

export function formatDataRate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(2)} Mbps`;
  }
  return `${kbps} kbps`;
}

export function formatLightTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  return `${minutes}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
}

export function formatDistance(km: number): string {
  if (km >= 1_000_000) {
    return `${(km / 1_000_000).toFixed(1)}M km`;
  }
  return `${km.toLocaleString()} km`;
}
