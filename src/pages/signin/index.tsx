import Head from "next/head";
import React from "react";

import AuthContainer from "@/components/auth/AuthContainer";
import SignInForm from "@/components/auth/form/SignInForm";
import withLogin from "@/components/auth/withLogin";

export default withLogin(function index() {
	return (
		<>
			<Head>
				<title>로그인 - Mogazoa</title>
				<meta name="description" content="로그인 페이지"></meta>
			</Head>
			<AuthContainer>
				<SignInForm />
			</AuthContainer>
		</>
	);
});
