import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getReviews } from "@/apis/products";
import { getMe } from "@/apis/user";
import { filterBy } from "@/constants/filterBy";
import { useIntersect } from "@/hooks/common/useIntersect";
import useThrottle from "@/hooks/common/useThrottle";
import { ReviewResponse } from "@/types/review";

import Dropdown from "../common/dropdown/Dropdown";
import NoneReview from "./NoneReview";
import ReviewCard from "./ReviewCard";

export default function ProductReview({ id }: { id: number }) {
	const [order, setOrder] = useState<
		"recent" | "ratingDesc" | "ratingAsc" | "likeCount"
	>("recent");

	const {
		data: reviewData,
		isLoading,
		isFetching,
		fetchNextPage,
		hasNextPage,
		isError,
	} = useInfiniteQuery({
		queryKey: ["review", id, order],
		queryFn: ({ pageParam = 0 }) =>
			getReviews({ cursor: pageParam, productId: id, order }),
		getNextPageParam: (lastPage: ReviewResponse) => {
			if (lastPage.list.length === 0) {
				return undefined;
			}
			return lastPage.nextCursor;
		},
		initialPageParam: null,
		enabled: !!id,
	});

	const fetchNextPageThrottled = useThrottle(fetchNextPage, 200);

	const intersectRef = useIntersect<HTMLDivElement>(
		async (entry, observer) => {
			observer.unobserve(entry.target);
			if (hasNextPage && !isFetching) {
				fetchNextPageThrottled();
			}
		},
		{ rootMargin: "50px" },
	);

	const myData = useQuery({
		queryKey: ["me"],
		queryFn: () => getMe(),
		retry: false,
	}).data;

	const handleOnSelect = (item: { id: number; name: string }) => {
		switch (item.id) {
			case 0:
				setOrder("recent");
				break;
			case 1:
				setOrder("ratingDesc");
				break;
			case 2:
				setOrder("ratingAsc");
				break;
			case 3:
				setOrder("likeCount");
				break;
			default:
				setOrder("recent");
		}
	};
	return (
		<div className="w-full lg:w-[94rem]">
			<div className="flex min-w-[33.5rem] items-center justify-between pb-[3rem] ">
				<span className="text-[1.8rem] text-white md:text-[1.6rem] lg:text-[2rem]">
					상품 리뷰
				</span>
				<Dropdown
					items={filterBy}
					defaultItem={filterBy[0]}
					onSelect={(item) => handleOnSelect(item)}
				>
					<Dropdown.Button variant={"small"} />
					<Dropdown.List />
				</Dropdown>
			</div>
			{!isError &&
				!isLoading &&
				!isFetching &&
				reviewData?.pages.map((page, index) => (
					<div key={index} className="flex flex-col gap-[1.5rem] lg:gap-[2rem]">
						{page.list.map((review) => (
							<ReviewCard
								reviewData={review}
								isMyReview={review.userId === myData?.id}
								key={review.id}
								order={order}
							/>
						))}
					</div>
				))}
			{reviewData?.pages[0].list.length === 0 && <NoneReview type="none" />}
			{(isLoading || isFetching) && <NoneReview type="loading" />}
			{isError && <NoneReview type="error" />}
			<div ref={intersectRef}></div>
		</div>
	);
}
