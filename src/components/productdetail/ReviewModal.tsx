import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

import { getImageURL } from "@/apis/getImage";
import { getProductDetail } from "@/apis/products";
import { createReview, modifyReview } from "@/apis/review";
import { starRate } from "@/constants/starRate";
import { Review } from "@/types/review";

import BasicButton from "../common/button/BasicButton";
import CategoryBadge from "../common/categoryBadge/CategoryBadge";
import ReviewModalAddImageBox, {
	ImageData,
	ImageType,
} from "./ReviewModalAddImageBox";

type Props = {
	type: "create" | "modify";
	closeModal: () => void;
	productId: number;
	reviewData?: Review;
};

export default function ReviewModal({
	type,
	closeModal,
	productId,
	reviewData,
}: Props) {
	const [rating, setRating] = useState(0);
	const [hover, setHover] = useState(0);
	const [content, setContent] = useState("");
	const [editorData, setEditorData] = useState<ImageData[]>([]);
	const [image, setImage] = useState<ImageType[]>([]);
	const [previousImage, setPreviousImage] = useState<ImageType[]>([]);
	const { rateArray, starOnIconSrc, starOffIconSrc } = starRate;
	const [isFocused, setIsFocused] = useState(false);
	const [errMsg, setErrMsg] = useState("");
	const [rateErrMsg, setRateErrMsg] = useState("");
	const [trigger, setTrigger] = useState(0);
	const [editImageId, setEditImageId] = useState<string | undefined>("");

	const queryClient = useQueryClient();

	const MAX_LENGTH = 300;
	const buttonLabel = type === "create" ? "작성하기" : "수정하기";

	const { data: productData } = useQuery({
		queryKey: ["productDetail", productId],
		queryFn: () => getProductDetail(productId),
		enabled: !!productId,
		staleTime: 60 * 1000,
		retry: false,
	});

	const { mutate: getImage } = useMutation({
		mutationFn: (index: number) => getImageURL(editorData[index].data),
		onSuccess: (data, index) => {
			if (image.length <= 3) {
				setImage((prev) =>
					prev.map((img) =>
						img.id === editorData[index].id ? { ...img, image: data.url } : img,
					),
				);
			}
		},
	});

	const { mutate: create, isPending: createPending } = useMutation({
		mutationFn: () => {
			const imageUrls = image.map((img) => img.image);
			return createReview(productId, imageUrls, content, rating);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["review", productId] });
			queryClient.invalidateQueries({
				queryKey: ["productDetail", productId],
			});
			closeModal();
		},
	});
	const { mutate: modify, isPending: modifyPending } = useMutation({
		mutationFn: () => {
			const reviewid = reviewData ? reviewData.id : 0;
			const idObjects = previousImage.map((item) => ({ id: Number(item.id) }));
			const imgObjects = image.map((item) => ({ source: item.image }));
			const imageUrls = [...idObjects, ...imgObjects];
			return modifyReview(reviewid, imageUrls, content, rating);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["review", productId] }),
				queryClient.invalidateQueries({
					queryKey: ["productDetail", productId],
				});
			closeModal();
		},
	});

	const prevTrigger = useRef(trigger);
	useEffect(() => {
		for (let i = 0; i <= 2; i++) {
			const existingImage = image.find(
				(img) => img.id === editorData[i]?.id && img.image,
			);

			if (
				!existingImage ||
				(prevTrigger.current !== trigger && editImageId === editorData[i]?.id)
			) {
				getImage(i);
			}
		}
	}, [editImageId, editorData, editorData.length, getImage, image, trigger]);

	useEffect(() => {
		if (type === "modify") {
			if (reviewData) {
				setPreviousImage(
					reviewData.reviewImages.map((data) => ({
						id: data.id.toString(),
						image: data.source,
						ref: React.createRef(),
					})),
				);
				setContent(reviewData?.content);
				setRating(reviewData?.rating);
			}
		}
	}, [reviewData, type]);

	const handleOnClick = () => {
		rating ? setRateErrMsg("") : setRateErrMsg("별점으로 상품을 평가해주세요.");
		if (content.length === 0) {
			setErrMsg("리뷰 내용을 입력해주세요.");
		}
		if (rating && content.length >= 10 && type === "create") {
			create();
		}
		if (rating && content.length >= 10 && type === "modify") {
			modify();
		}
	};

	const handleOnTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value);
	};

	const handleOnBlur = () => {
		setIsFocused(false);
		if (content.length === 0) {
			setErrMsg("리뷰 내용을 입력해주세요.");
		}
		if (content) {
			setErrMsg("");
		}
		if (content.length >= 1 && content.length < 10) {
			setErrMsg("최소 10자 이상 적어주세요.");
		}
	};

	return (
		<div className="flex h-[49.8rem] w-[33.5rem] flex-col gap-[2rem]  md:h-[58.2rem] md:w-[51rem] md:gap-[4rem] lg:h-[62.8rem] lg:w-[54rem]">
			<div className="flex flex-col gap-[1rem]">
				{productData && (
					<CategoryBadge size="small" category={productData?.category.name} />
				)}
				<div className="text-[2rem] font-semibold text-white lg:text-[2.4rem]">
					{productData?.name}
				</div>
			</div>
			<div className="flex flex-col gap-[1rem] md:gap-[1.5rem] lg:gap-[2rem]">
				<div className=" flex items-center gap-[1.5rem] lg:gap-[2rem]">
					<span className="text-[1.4rem] text-gray-200 lg:text-[1.6rem]">
						별점
					</span>
					<div className="flex gap-[0.2rem] lg:gap-[0.5rem]">
						{rateArray.map((rate, index) => (
							<button
								key={index}
								onMouseEnter={() => setHover(rate)}
								onMouseLeave={() => setHover(0)}
								onClick={() => setRating(rate)}
							>
								<div className="relative size-[2.8rem] md:size-[3.2rem] ">
									<Image
										alt="star_rate"
										src={
											rate <= (hover || rating) ? starOnIconSrc : starOffIconSrc
										}
										fill
										className=" object-cover"
									/>
								</div>
							</button>
						))}
					</div>
					{
						<span className="text-[1rem] text-[#F00] md:text-[1.5rem]">
							{rateErrMsg}
						</span>
					}
				</div>
				<div
					className={`min-h-[8.8rem] rounded-xl border ${isFocused ? "border-main_blue" : "border-[#353542]"} bg-[#252530] p-[2rem]`}
				>
					<textarea
						className="w-full resize-none overflow-hidden border-none bg-[#252530] text-[1.4rem] text-white placeholder:text-[1.4rem] placeholder:text-gray-200 focus:outline-none lg:text-[1.6rem] lg:placeholder:text-[1.6rem]"
						rows={3}
						onChange={handleOnTextarea}
						onFocus={() => setIsFocused(true)}
						onBlur={handleOnBlur}
						maxLength={MAX_LENGTH}
						value={isFocused ? (content ? content : "") : content}
					/>
					<p className="text-right text-[1.4rem] text-[#6E6E82]">
						<span>{content.length}</span>
						<span>/{MAX_LENGTH}</span>
					</p>
				</div>
				{errMsg && (
					<div className="text-[1rem] text-[#F00] md:text-[1.5rem]">
						{errMsg}
					</div>
				)}
				<div className="flex gap-[1rem] md:gap-[1.5rem] lg:gap-[2rem]">
					<ReviewModalAddImageBox
						editorData={editorData}
						setEditorData={setEditorData}
						previousImage={previousImage}
						setPreviousImage={setPreviousImage}
						setImage={setImage}
						type={type}
						setTrigger={setTrigger}
						setEditImageId={setEditImageId}
					/>
				</div>
			</div>
			<BasicButton
				variant="primary"
				label={buttonLabel}
				onClick={handleOnClick}
				disabled={createPending || modifyPending}
			/>
		</div>
	);
}
