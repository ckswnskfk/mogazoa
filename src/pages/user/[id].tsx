import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { getMe, getUserDetail } from "@/apis/user";
import MovingPageModal from "@/components/common/modal/MovingPageModal";
import Loading from "@/components/user/Loading";
import ProfilePageLayout from "@/components/user/ProfilePageLayout";
import { moveModalText } from "@/constants/modalText";
import { useModalActions } from "@/store/modal";
import { UserDetail } from "@/types/user";
import getAccessTokenFromReq from "@/utils/getAccessTokenFromReq";
import getCookies from "@/utils/getCookies";

export async function getServerSideProps({
	req,
	params,
}: GetServerSidePropsContext) {
	const queryClient = new QueryClient();
	const userId = Number(params?.id);

	if (Number.isNaN(userId)) {
		return {
			notFound: true,
		};
	}

	await queryClient.prefetchQuery<UserDetail>({
		queryKey: ["user", userId],
		queryFn: () =>
			getUserDetail(userId, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}),
		staleTime: 60 * 1000,
	});

	const accessToken = getAccessTokenFromReq(req);

	if (accessToken) {
		try {
			const me = await getMe({
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (me.id === userId) {
				return {
					redirect: {
						destination: "/mypage",
						permanent: false,
					},
				};
			}
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(
					`error:${error.response?.status} ${error.response?.statusText},`,
					error.response?.data.message,
				);
			}
		}
	}

	return {
		props: { dehydratedState: dehydrate(queryClient) },
	};
}

export default function UserPage() {
	const router = useRouter();
	const userId = Number(router.query["id"]);
	const { openModal, closeModal } = useModalActions();

	const { data: user, error } = useQuery<UserDetail>({
		queryKey: ["user", userId],
		queryFn: () => getUserDetail(userId),
		staleTime: 60 * 1000,
		retry: 0,
	});

	useEffect(() => {
		if (error && isAxiosError<{ message: string }>(error)) {
			if (getCookies().accessToken) {
				document.cookie =
					"accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			}
			const modalId = openModal(
				<MovingPageModal
					description={moveModalText.signin}
					closeModal={() => closeModal(modalId)}
					url="/signin"
				/>,
			);
		}
	}, [error, router, openModal, closeModal]);

	if (!user) {
		return <Loading />;
	}

	return (
		<>
			<Head>
				<title>유저 정보 - Mogazoa</title>
				<meta
					name="description"
					content="유저의 정보를 조회할 수 있는 페이지"
				></meta>
			</Head>
			<ProfilePageLayout user={user} />;
		</>
	);
}
