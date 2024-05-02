import { motion } from "framer-motion";
import Image from "next/image";
import { forwardRef } from "react";

import Counts from "@/components/common/counts/Counts";

type Props = {
	productName: string;
	imageData: string;
	reviewCount: number;
	likeCount: number;
	rate: number;
};

const ProductCard = forwardRef<HTMLDivElement, Props>(function ProductCard(
	{ productName, imageData, reviewCount, likeCount, rate }: Props,
	ref,
) {
	const starIconSrc = "/icons/star_on.svg";
	const roundedRate = parseFloat(rate.toFixed(2));

	return (
		<motion.div
			ref={ref}
			className="flex max-h-[18.3rem] max-w-[16rem] grow flex-col gap-[1rem] rounded-[1.2rem] border border-black-border bg-black-bg p-[1rem] md:max-h-[25.6rem] md:max-w-[24.7rem] md:gap-[2rem] md:px-[1rem] md:pb-[2rem] md:pt-[1rem] lg:max-h-[30.8rem] lg:max-w-[30rem] lg:gap-[2.5rem] lg:pb-[2.5rem]"
			whileHover={{ scale: 1.03, borderColor: "#5097FA" }}
			whileTap={{ scale: 0.95, borderColor: "#5097FA" }}
		>
			<div className="relative h-[14rem] max-w-[14rem] md:h-[22.7rem] md:max-w-[22.7rem] lg:h-[18.4rem] lg:max-w-[28.4rem]">
				<Image
					src={imageData}
					alt={productName}
					className="object-contain"
					fill
					sizes="(min-width: 1024px) 278px, (min-width: 768px) 225px, 138px"
				/>
			</div>
			<div className="flex flex-col md:gap-[1rem] md:px-[0.65rem] lg:px-[1rem]">
				<div className="truncate text-[1.4rem] text-white md:text-[1.6rem] lg:text-[1.8rem]">
					{productName}
				</div>
				<div className="flex flex-col justify-between md:flex-row lg:flex-row">
					<Counts>
						<Counts.Count size="large" text="리뷰" count={reviewCount} />
						<Counts.Count size="large" text="찜" count={likeCount} />
					</Counts>
					<div className="flex items-center">
						<div className="relative mr-[0.2rem] size-[1.2rem] md:size-[1.5rem] lg:size-[1.6rem]">
							<Image
								src={starIconSrc}
								alt="별점"
								className="object-cover"
								fill
							/>
						</div>
						<div className="text-[1.2rem] text-gray-100 md:text-[1.4rem] lg:text-[1.6rem]">
							{roundedRate}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
});

export default ProductCard;
