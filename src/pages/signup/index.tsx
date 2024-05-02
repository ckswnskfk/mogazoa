import Head from "next/head";
import React from "react";

import AuthContainer from "@/components/auth/AuthContainer";
import SignupForm from "@/components/auth/form/SignupForm";
import withLogin from "@/components/auth/withLogin";

export default withLogin(function index() {
	return (
		<>
			<Head>
				<title>회원가입 - Mogazoa</title>
				<meta name="description" content="회원가입 페이지"></meta>
			</Head>
			<AuthContainer>
				<SignupForm />
			</AuthContainer>
		</>
	);
});
