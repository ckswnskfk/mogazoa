import axios from "axios";
import clsx from "clsx";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { getProducts } from "@/apis/products";
import { getMe } from "@/apis/user";
import AddProductButton from "@/components/common/button/AddProductButton";
import Header from "@/components/common/menu/Header";
import { SideBar } from "@/components/common/menu/SideBar";
import ProductList from "@/components/home/ProductList";
import ReviewerRanking from "@/components/home/ReviewerRanking";
import { BREAK_POINT } from "@/constants/breakPoint";
import { useIntersect } from "@/hooks/common/useIntersect";
import useWindowWidth from "@/hooks/common/useWindowWidth";
import { GetProductsParams, Order, ProductsResponse } from "@/types/product";
import getDataByScroll from "@/utils/getDataByScroll";

export default function HomeLayout() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isSidebarOpen, setSidebarOpen] = useState(false);
	const currentWidth = useWindowWidth();
	const [isWrapPoint, setIsWrapPoint] = useState(false);
	const [isOverflow, setIsOverflow] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
		null,
	);
	const [selectedCategoryName, setSelectedCategoryName] = useState<
		string | null
	>(null);
	const router = useRouter();
	const searchKeyword = router.query.search as string;

	// getProducts API 요청 시 전달할 params 객체
	const [params, setParams] = useState<GetProductsParams>({
		keyword: searchKeyword,
		category: undefined,
		order: undefined,
		cursor: undefined,
	});

	// API 요청으로 받아 온 products 데이터
	const [products, setProducts] = useState<ProductsResponse>();

	// keyword - router로 받아오기 때문에, 키워드는 검색하면 이 컴포넌트가 리랜더링되어, useState의 초기값으로 돌아갈 것으로 생각됨.
	useEffect(() => {
		setParams((prev) => ({
			...prev,
			keyword: searchKeyword,
		}));
	}, [searchKeyword]);

	useEffect(() => {
		const fetchProducts = async () => {
			const data = await getProducts(params);
			setProducts(data);
			console.log("fetchProducts" + " " + data.nextCursor);
		};

		console.log("fetchProducts Effect" + " " + products?.nextCursor);

		fetchProducts();
	}, [params, products?.nextCursor]);

	// 카테고리를 선택했을 때 (order는 최신순으로 초기화)
	const handleSelectCategory = (
		categoryId: number | null,
		categoryName: string | null,
	) => {
		setParams((prev) => ({
			...prev,
			category: categoryId || undefined,
			order: "recent",
			cursor: products?.nextCursor,
		}));
		setSelectedCategoryId(categoryId);
		setSelectedCategoryName(categoryName);
	};

	// 1. 홈페이지의 기본 "리뷰 많은 순", "별점 높은 순"의 경우
	// 2. 정렬을 선택했을 때 (keyword, category 유지)
	const handleSelectOrder = (order: Order) => {
		setParams((prev) => ({
			...prev,
			order: order,
			cursor: products?.nextCursor,
		}));
	};

	// 무한스크롤 ?
	const fetchMoreProducts = async () => {
		const nextCursor = products?.nextCursor;
		if (!nextCursor) return;

		const data = await getProducts({ ...params, cursor: nextCursor });

		setProducts((prevProducts) =>
			prevProducts
				? {
						...prevProducts,
						list: [...prevProducts.list, ...data.list],
						nextCursor: data.nextCursor,
					}
				: data,
		);

		// setParams((prev) => ({ ...prev, cursor: data.nextCursor }));
	};

	const intersectRef = useIntersect(
		async (entry, observer) => {
			observer.unobserve(entry.target);
			if (products?.nextCursor) {
				fetchMoreProducts();
			}
		},
		{ rootMargin: "200px" },
	);

	// 메인페이지에서 보여 줄 지금 핫한 상품, 별점 높은 상품
	const [highReviewCountProduct, setHighReviewCountProduct] =
		useState<ProductsResponse>({ nextCursor: 0, list: [] });
	const [highRatingProduct, setHighRatingProduct] = useState<ProductsResponse>({
		nextCursor: 0,
		list: [],
	});

	useEffect(() => {
		const fetchProducts = async (
			order: Order,
			setState: Dispatch<SetStateAction<ProductsResponse>>,
		) => {
			const data = await getProducts({ order: order });
			const top6 = data.list.slice(0, 6);
			setState({ nextCursor: data.nextCursor, list: top6 });
		};

		fetchProducts("reviewCount", setHighReviewCountProduct);
		fetchProducts("rating", setHighRatingProduct);
	}, []);

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				await getMe();
				setIsLoggedIn(true);
			} catch (error) {
				if (
					axios.isAxiosError(error) &&
					error.response &&
					error.response.status === 401
				) {
					setIsLoggedIn(false);
				} else {
					alert("유저 정보를 불러오는 데 실패하였습니다: " + error);
				}
			}
		};

		checkLoginStatus();
	}, []);

	const toggleSidebar = () => {
		setSidebarOpen(!isSidebarOpen);
	};

	useEffect(() => {
		setIsWrapPoint(BREAK_POINT.md < currentWidth && currentWidth < 1787);
		setIsOverflow(currentWidth < 360);
	}, [currentWidth]);

	return (
		<div className="h-screen bg-[#1c1c22]">
			<Header
				toggleSidebar={toggleSidebar}
				isSidebarOpen={isSidebarOpen}
				headerType="homeHeader"
			/>
			<div className="w-[100%] overflow-auto bg-[#1c1c22] pb-[10rem]">
				<div
					className={clsx(
						"flex flex-row",
						isWrapPoint ? "lg:mx-[5rem]" : "lg:mx-[18rem]",
					)}
				>
					<SideBar
						isSidebarOpen={isSidebarOpen}
						onCategorySelect={handleSelectCategory}
					/>
					<div className="hidden lg:mx-auto lg:flex lg:flex-col">
						{!selectedCategoryId && !searchKeyword && (
							<>
								<ProductList
									type="review"
									products={highReviewCountProduct}
									selectedCategoryName={selectedCategoryName}
								/>
								<ProductList
									type="rating"
									products={highRatingProduct}
									selectedCategoryName={selectedCategoryName}
								/>
							</>
						)}
						{!selectedCategoryId && searchKeyword && (
							<ProductList
								type="search"
								products={products}
								handleSelectOrder={handleSelectOrder}
								params={params}
								ref={intersectRef}
							/>
						)}
						{selectedCategoryId && (
							<ProductList
								type="category"
								selectedCategoryName={selectedCategoryName}
								handleSelectOrder={handleSelectOrder}
								products={products}
								params={params}
								ref={intersectRef}
							/>
						)}
					</div>
					<div className="hidden lg:block">
						<ReviewerRanking />
					</div>
					<div
						className={clsx(
							"flex flex-col gap-[6rem] md:w-[60rem] lg:hidden",
							isOverflow ? "w-[100%]" : "mx-auto",
						)}
					>
						<ReviewerRanking />
						{!selectedCategoryId && !searchKeyword && (
							<>
								<ProductList
									type="review"
									products={highReviewCountProduct}
									selectedCategoryName={selectedCategoryName}
								/>
								<ProductList
									type="rating"
									products={highRatingProduct}
									selectedCategoryName={selectedCategoryName}
								/>
							</>
						)}
						{!selectedCategoryId && searchKeyword && (
							<ProductList
								type="search"
								products={products}
								handleSelectOrder={handleSelectOrder}
								params={params}
								ref={intersectRef}
							/>
						)}
						{selectedCategoryId && (
							<ProductList
								type="category"
								selectedCategoryName={selectedCategoryName}
								handleSelectOrder={handleSelectOrder}
								products={products}
								params={params}
								ref={intersectRef}
							/>
						)}
					</div>
				</div>
				<AddProductButton isLoggedIn={isLoggedIn} />
			</div>
		</div>
	);
}
