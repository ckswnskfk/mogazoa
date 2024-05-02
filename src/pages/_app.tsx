import "@/styles/globals.css";

import {
	HydrationBoundary,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactNode, useState } from "react";

import ModalWrapper from "@/components/common/modal/ModalWrapper";
import { useModalActions, useModalsStore } from "@/store/modal";

function Providers({
	children,
	pageProps,
}: {
	children: ReactNode;
	pageProps: any;
}) {
	const [queryClient] = useState(() => new QueryClient());
	const modals = useModalsStore();
	const { closeModal } = useModalActions();

	return (
		<>
			<QueryClientProvider client={queryClient}>
				<HydrationBoundary state={pageProps.dehydratedState}>
					{modals.map((modal) => (
						<ModalWrapper
							id={modal.id}
							key={modal.id}
							onRemove={() => closeModal(modal.id)}
							config={modal.config}
						>
							{modal.content}
						</ModalWrapper>
					))}
					{children}
				</HydrationBoundary>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</>
	);
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Mogazoa</title>
				<meta name="description" content="상품 비교 플랫폼 모가조아!"></meta>
			</Head>
			<Providers pageProps={pageProps}>
				<Component {...pageProps} />
			</Providers>
		</>
	);
}
