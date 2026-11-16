// 서버의 후보 API가 생기기 전까지 화면을 확인하기 위한 가짜 데이터
export interface Candidate {
  id: string;
  name: string;
  age: number;
  school: string;
  major: string;
  distanceKm: number;
  tags: string[];
}

export const mockCandidates: Candidate[] = [
  { id: 'c1', name: '서윤', age: 22, school: '연세대학교', major: '경영학과', distanceKm: 0, tags: ['#러닝', '#재즈'] },
  { id: 'c2', name: '하린', age: 23, school: '이화여자대학교', major: '심리학과', distanceKm: 0.8, tags: ['#전시회', '#베이킹'] },
  { id: 'c3', name: '도현', age: 24, school: '서강대학교', major: '컴퓨터공학과', distanceKm: 1.7, tags: ['#보드게임', '#코딩'] },
  { id: 'c4', name: '지우', age: 21, school: '홍익대학교', major: '시각디자인과', distanceKm: 2.0, tags: ['#필름카메라', '#카페'] },
];
