import Head from "next/head";
import { useEffect } from "react";

import Header from "@/components/common/menu/Header";
import CompareForm from "@/components/compare/CompareForm";
import Loading from "@/components/compare/Loading";
import Result from "@/components/compare/Result";
import useCompareQueries from "@/hooks/compare/useCompareQueries";
import OpenSigninModal from "@/utils/useSigninModal";

export default function Index() {
	const {
		products: { firstProduct, secondProduct },
	} = useCompareQueries();

	const openSigninModal = OpenSigninModal();

	useEffect(() => {
		openSigninModal && openSigninModal();
	}, [openSigninModal]);

	return (
		<>
			<Head>
				<title>상품 비교 - Mogazoa</title>
				<meta
					name="description"
					content="사용자가 원하는 상품 두 개를 비교해 볼 수 있습니다!"
				></meta>
			</Head>
			<div className="h-full min-h-screen bg-[#1c1c22]">
				<Header />
				<div className="_flex-col-center mx-8 gap-24 pb-16 pt-12 md:mx-12 md:max-w-[94rem] md:pb-40 md:pt-16 lg:mx-auto lg:max-w-[96rem] lg:gap-32 lg:pt-24">
					<CompareForm openSigninModal={openSigninModal} />
					<div>
						{firstProduct && secondProduct ? (
							<Result
								firstProduct={firstProduct}
								secondProduct={secondProduct}
							/>
						) : (
							<div className="mt-28 md:mt-72">
								<Loading />
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
