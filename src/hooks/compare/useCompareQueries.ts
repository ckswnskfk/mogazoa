import { useQueries } from "@tanstack/react-query";
import { useCallback } from "react";

import { getProductDetail } from "@/apis/products";
import useCompareStore from "@/store/compare";

export default function useCompareQueries() {
	const state = useCompareStore((state) => state);

	const { products } = state;

	// TODO: queryFn에서 타입 오류가 나서, 일단 undefined이면 0이 할당되도록 했음 -> 더 좋은 방법 고민
	const firstProductId = products.firstProduct?.id ?? 0;
	const secondProductId = products.secondProduct?.id ?? 0;
	const productIds = [firstProductId, secondProductId];

	const { data, refetchFnArray } = useQueries({
		queries: productIds.map((id) => ({
			queryKey: ["products", id],
			queryFn: () => getProductDetail(id),
			enabled: false,
		})),
		combine: (results) => ({
			data: results.map((result) => result.data),
			refetchFnArray: results.map((result) => result.refetch),
		}),
	});

	const firstProduct = data?.[0];
	const secondProduct = data?.[1];

	const refetchAll = useCallback(() => {
		refetchFnArray.forEach((refetch) => refetch());
	}, [refetchFnArray]);

	return {
		state,
		products: { firstProduct, secondProduct },
		refetchAll,
	};
}
