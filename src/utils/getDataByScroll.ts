import { RefObject } from "react";

// TODO: ref에 제네릭 타입 지정 어떻게 하죠?

/**
 * 사용자가 얼마나 스크롤했을 때, 다음 데이터를 불러오고 싶은지 설정할 수 있는 함수
 * @param ref 무한 스크롤로 불러오고자 하는 리스트를 담고 있는 부모 태그에 부여한 useRef 속성
 * @param nextCursor 목록 api 조회 결과에 포함된 nextCursor 값
 * @param handleLoadMoreData nextCursor 값을 넣어서 추가 데이터를 불러오는 등의 행동을 구현한 함수
 * @param threshold 사용자가 어느 정도 스크롤 했을 때, 다음 데이터를 불러오고 싶은지 설정
 * @returns void
 */
export default function getDataByScroll(
	ref: RefObject<HTMLElement>,
	nextCursor: number | undefined,
	handleLoadMoreData: (nextCursor: number) => void,
	threshold: number = 100,
) {
	if (!nextCursor) return;

	const { scrollTop, scrollHeight, clientHeight } = ref.current ?? {};

	if (!scrollTop || !scrollHeight || !clientHeight) return;

	if (Math.abs(scrollHeight - clientHeight - scrollTop) <= threshold) {
		handleLoadMoreData(nextCursor);
	}
}
