// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	devtools: { enabled: true },
	devServer: {
		host: "0.0.0.0",
		port: 3000,
	},
	modules: [
		// '@nuxtjs/tailwindcss',
		"@nuxt/ui",
	],
	app: {
		head: {
			title: "360 Image Viewer",
			link: [
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css?family=Poppins",
				},
			],
		},
	},
	colorMode: {
		preference: "light",
	},
});
