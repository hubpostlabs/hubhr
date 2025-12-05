import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	logging: {
		incomingRequests: true,
		fetches: {
			fullUrl: true,
			hmrRefreshes: true,
		}
	}
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
