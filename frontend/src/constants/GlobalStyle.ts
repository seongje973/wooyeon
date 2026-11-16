import { Colors } from '@/constants/Colors';

export const Radius = {
  card: 24,
  button: 16,
  pill: 999,
} as const;

// boxShadow는 새 아키텍처(iOS·Android)와 웹에서 같은 모양으로 그려진다.
export const Shadow = {
  card: { boxShadow: `0px 8px 24px ${Colors.shadow}` },
  button: { boxShadow: `0px 4px 12px ${Colors.shadow}` },
  bar: { boxShadow: `0px -2px 12px ${Colors.shadow}` },
} as const;
