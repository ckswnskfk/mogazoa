import { cva, type VariantProps } from "class-variance-authority";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";

import cn from "@/utils/cn";

const profileImageVariants = cva("relative overflow-hidden rounded-full", {
	variants: {
		size: {
			small: "size-[3.6rem] lg:size-[4.2rem]",
			medium: "size-[4.8rem] lg:size-[5.2rem]",
			large: "size-[12rem] lg:size-[18rem]",
		},
	},
});

type Props = React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof profileImageVariants> & {
		size: "small" | "medium" | "large";
		src: null | string;
	};

export default function ProfileImage({ src, size }: Props) {
	const [isError, setIsError] = useState(false);
	const iconSrc = src ? src : "/icons/profile.svg";

	return (
		<div className={cn(profileImageVariants({ size }), "flex shrink-0")}>
			{isError ? (
				<Image
					src={"/icons/profile.svg"}
					alt="사용자 프로필 이미지"
					fill
					onError={() => setIsError(true)}
				/>
			) : (
				<Image
					src={iconSrc}
					alt="사용자 프로필 이미지"
					fill
					onError={() => setIsError(true)}
					priority
				/>
			)}
		</div>
	);
}
