/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,

	exportPathMap: () => {
		return {
			'/photos': { page: '/photo-gallery' },
		}
	},

	images: {
		domains: [
			"firebasestorage.googleapis.com"
		]
	}
}

module.exports = nextConfig