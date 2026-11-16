export interface University {
  id: string;
  name: string;
  // 학교 이메일 도메인. 하위 도메인(g.hongik.ac.kr 등)도 같은 학교로 본다.
  domains: string[];
  // 캠퍼스 대략 좌표(정문 근처). 주변 학교 거리 계산에만 쓴다.
  latitude: number;
  longitude: number;
}

// 첫 서비스 지역(서울) 학교 목록. 도메인·좌표는 출시 전에 학교별로 다시 확인해야 한다.
export const Universities: University[] = [
  { id: 'snu', name: '서울대학교', domains: ['snu.ac.kr'], latitude: 37.4598, longitude: 126.9519 },
  { id: 'yonsei', name: '연세대학교', domains: ['yonsei.ac.kr'], latitude: 37.5658, longitude: 126.9386 },
  { id: 'korea', name: '고려대학교', domains: ['korea.ac.kr'], latitude: 37.5894, longitude: 127.0323 },
  { id: 'skku', name: '성균관대학교', domains: ['skku.edu'], latitude: 37.588, longitude: 126.993 },
  { id: 'hanyang', name: '한양대학교', domains: ['hanyang.ac.kr'], latitude: 37.5572, longitude: 127.0453 },
  { id: 'sogang', name: '서강대학교', domains: ['sogang.ac.kr'], latitude: 37.5509, longitude: 126.941 },
  { id: 'ewha', name: '이화여자대학교', domains: ['ewha.ac.kr', 'ewhain.net'], latitude: 37.5622, longitude: 126.9468 },
  { id: 'cau', name: '중앙대학교', domains: ['cau.ac.kr'], latitude: 37.5048, longitude: 126.9572 },
  { id: 'khu', name: '경희대학교', domains: ['khu.ac.kr'], latitude: 37.5965, longitude: 127.0518 },
  { id: 'hufs', name: '한국외국어대학교', domains: ['hufs.ac.kr'], latitude: 37.5973, longitude: 127.0589 },
  { id: 'konkuk', name: '건국대학교', domains: ['konkuk.ac.kr'], latitude: 37.5407, longitude: 127.0793 },
  { id: 'dongguk', name: '동국대학교', domains: ['dongguk.edu'], latitude: 37.5582, longitude: 127.0002 },
  { id: 'hongik', name: '홍익대학교', domains: ['hongik.ac.kr'], latitude: 37.5509, longitude: 126.9255 },
  { id: 'uos', name: '서울시립대학교', domains: ['uos.ac.kr'], latitude: 37.5838, longitude: 127.0587 },
  { id: 'sookmyung', name: '숙명여자대학교', domains: ['sookmyung.ac.kr', 'sm.ac.kr'], latitude: 37.5463, longitude: 126.9648 },
  { id: 'kookmin', name: '국민대학교', domains: ['kookmin.ac.kr'], latitude: 37.6106, longitude: 126.997 },
];
