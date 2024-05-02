/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "sprint-fe-project.s3.ap-northeast-2.amazonaws.com",
				pathname: "/Mogazoa/**",
			},
		],
	},
};

export default nextConfig;
