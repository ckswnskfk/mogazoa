import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { getProductDetail } from "@/apis/products";
import { getMe } from "@/apis/user";

import AddProductButton from "../common/button/AddProductButton";
import ProductDetail from "./ProductDetail";
import ProductReview from "./ProductReview";
import ProductStatistics from "./ProductStatistics";

export default function ProductDetailPageLayout() {
	const router = useRouter();
	const productId = Number(router.query.id);

	const { isError } = useQuery({
		queryKey: ["productDetail", productId],
		queryFn: () => getProductDetail(productId),
		enabled: !!productId,
		staleTime: 60 * 1000,
		retry: false,
	});

	const { error } = useQuery({
		queryKey: ["me"],
		queryFn: () => getMe(),
		retry: false,
	});

	const isLoggedIn = () => {
		if (isAxiosError(error)) {
			if (error.request.status === 401) return false;
		} else {
			return true;
		}
	};

	useEffect(() => {
		if ((router.isReady && isNaN(productId)) || isError) {
			router.push("/");
		}
	}, [productId, router.isReady, isError, router]);

	return (
		<main className="_flex-col-center gap-[6rem] bg-[#1C1C22] px-[2rem] py-[3rem] md:px-[3rem] md:py-[4rem] lg:py-[6rem]">
			<ProductDetail id={productId} />
			<ProductStatistics id={productId} />
			<ProductReview id={productId} />
			<AddProductButton isLoggedIn={isLoggedIn()} />
		</main>
	);
}
