import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	{ path: "login", file: "routes/login.tsx" },
	{ path: "signup", file: "routes/signup.tsx" },
	{
		path: "admin",
		file: "routes/admin/layout.tsx",
		children: [
			{ index: true, file: "routes/admin/dashboard.tsx" },
		],
	},
] satisfies RouteConfig;
