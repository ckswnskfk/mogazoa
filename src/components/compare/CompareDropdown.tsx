import clsx from "clsx";
import { RefObject, useEffect, useRef } from "react";

import useThrottle from "@/hooks/common/useThrottle";
import { ProductsResponse } from "@/types/product";
import getDataByScroll from "@/utils/getDataByScroll";

type Props = {
	focusIndex: number;
	productList?: ProductsResponse;
	dropdownRef: RefObject<HTMLDivElement>;
	handleAddProduct: (id: number, name: string) => void;
	handleLoadMoreProducts: (nextCursor: number) => void;
};

export default function CompareDropdown({
	focusIndex,
	productList,
	dropdownRef,
	handleAddProduct,
	handleLoadMoreProducts,
}: Props) {
	const scrollRef = useRef<HTMLUListElement>(null);
	const focusRef = useRef<HTMLButtonElement>(null);

	const nextCursor = productList?.nextCursor;

	const handleScroll = () =>
		getDataByScroll(scrollRef, nextCursor, handleLoadMoreProducts);

	const throttledHandleLoadMoreData = useThrottle(handleScroll, 200);

	useEffect(() => {
		const currentScrollRef = scrollRef.current;

		const throttledHandleLoadMoreDataWithTab = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				throttledHandleLoadMoreData();
			}
		};

		setTimeout(() =>
			focusRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }),
		);

		if (currentScrollRef) {
			currentScrollRef.addEventListener("scroll", throttledHandleLoadMoreData);
			currentScrollRef.addEventListener(
				"keydown",
				throttledHandleLoadMoreDataWithTab,
			);
		}

		return () => {
			if (currentScrollRef) {
				currentScrollRef.removeEventListener(
					"scroll",
					throttledHandleLoadMoreData,
				);
				currentScrollRef.removeEventListener(
					"keydown",
					throttledHandleLoadMoreDataWithTab,
				);
			}
		};
	}, [focusIndex, nextCursor, throttledHandleLoadMoreData]);

	return (
		<div ref={dropdownRef}>
			<ul
				ref={scrollRef}
				className="_scrollbar absolute left-0 top-full z-10 mt-2 flex h-[16.3rem] w-full flex-col gap-2 rounded-[0.8rem] border border-solid border-black-border bg-black-bg p-[1rem] lg:h-[17.1rem]"
			>
				{productList?.list.map(({ id, name }, index) => (
					<li key={id}>
						<button
							className={clsx(
								"w-full rounded-[0.6rem] px-[2rem] py-[0.6rem] text-start text-[1.4rem] leading-[2rem] text-gray-200 hover:bg-black-border hover:text-white focus:bg-black-border focus:text-white focus:outline-none lg:text-[1.6rem] lg:leading-[2.2rem]",
								focusIndex === index && "bg-black-border text-white",
							)}
							onClick={() => handleAddProduct(id, name)}
							type="button"
							ref={focusIndex === index ? focusRef : undefined}
						>
							{name}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
