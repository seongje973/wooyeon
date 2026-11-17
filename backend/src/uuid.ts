// 요청 본문으로 받은 사용자 id 확인용. 형식이 틀린 값을 DB까지 보내면 500이 난다.
export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
