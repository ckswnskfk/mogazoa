import Head from "next/head";

import Header from "@/components/common/menu/Header";
import ProductDetailPageLayout from "@/components/productdetail/ProductDetailPageLayout";

export default function ProductDetailPage() {
	return (
		<>
			<Head>
				<title>상품 상세 - Mogazoa</title>
				<meta
					name="description"
					content="각 상품의 상세 정보를 확인할 수 있습니다."
				></meta>
			</Head>
			<div className="bg-[#1C1C22]">
				<Header />
				<ProductDetailPageLayout />
			</div>
		</>
	);
}
