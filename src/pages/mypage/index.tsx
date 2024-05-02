import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useEffect } from "react";

import { getMe } from "@/apis/user";
import Loading from "@/components/user/Loading";
import ProfilePageLayout from "@/components/user/ProfilePageLayout";
import { UserDetail } from "@/types/user";
import getAccessTokenFromReq from "@/utils/getAccessTokenFromReq";

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
	const queryClient = new QueryClient();

	const accessToken = getAccessTokenFromReq(req);
	if (!accessToken) {
		return {
			redirect: {
				destination: "/signin",
				permanent: false,
			},
		};
	}

	await queryClient.prefetchQuery<UserDetail>({
		queryKey: ["me"],
		queryFn: () =>
			getMe({
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}),
		staleTime: 60 * 1000,
	});

	return {
		props: { dehydratedState: dehydrate(queryClient) },
	};
}

export default function MyPage() {
	const { data: me, error } = useQuery<UserDetail>({
		queryKey: ["me"],
		queryFn: getMe,
		staleTime: 60 * 1000,
		retry: 0,
	});

	useEffect(() => {
		if (error && isAxiosError<{ message: string }>(error)) {
			console.error("error", error);
			alert(error.response?.data.message);
			window.location.href = "/";
		}
	}, [error]);

	if (!me) {
		return <Loading />;
	}

	return (
		<>
			<Head>
				<title>마이 페이지 - Mogazoa</title>
				<meta name="description" content="내 정보 페이지"></meta>
			</Head>
			<ProfilePageLayout user={me} />;
		</>
	);
}
