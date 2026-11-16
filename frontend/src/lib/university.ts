import { Universities, University } from '@/constants/Universities';

export const findUniversityByEmail = (email: string): University | undefined => {
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined;
  const domain = parts[1];
  return Universities.find((u) =>
    u.domains.some((d) => domain === d || domain.endsWith(`.${d}`)),
  );
};

// 두 좌표 사이 직선 거리(km, 하버사인 공식)
export const distanceKm = (a: University, b: University): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

// 내 학교에서 radiusKm 안에 있는 다른 학교를 가까운 순으로 돌려준다.
export const findNearbyUniversities = (
  home: University,
  radiusKm: number,
): { university: University; distanceKm: number }[] =>
  Universities.filter((u) => u.id !== home.id)
    .map((u) => ({ university: u, distanceKm: distanceKm(home, u) }))
    .filter((n) => n.distanceKm <= radiusKm)
    .sort((x, y) => x.distanceKm - y.distanceKm);
