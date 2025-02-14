export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {"start":"_app/immutable/entry/start.HSBUrRJA.js","app":"_app/immutable/entry/app.CgV957P3.js","imports":["_app/immutable/entry/start.HSBUrRJA.js","_app/immutable/chunks/entry.BAhbu8Bx.js","_app/immutable/chunks/runtime.DExCUZGw.js","_app/immutable/chunks/index-client.BmxZP1LF.js","_app/immutable/entry/app.CgV957P3.js","_app/immutable/chunks/preload-helper.DocKlGQB.js","_app/immutable/chunks/runtime.DExCUZGw.js","_app/immutable/chunks/disclose-version.COp2Sx5X.js","_app/immutable/chunks/store._3t7VsMo.js","_app/immutable/chunks/props.BJwpzjIc.js","_app/immutable/chunks/index-client.BmxZP1LF.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../../output/server/nodes/0.js')),
			__memo(() => import('../../output/server/nodes/1.js')),
			__memo(() => import('../../output/server/nodes/2.js')),
			__memo(() => import('../../output/server/nodes/3.js')),
			__memo(() => import('../../output/server/nodes/4.js')),
			__memo(() => import('../../output/server/nodes/5.js')),
			__memo(() => import('../../output/server/nodes/6.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/mindmaps",
				pattern: /^\/mindmaps\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/mindmaps/[id]",
				pattern: /^\/mindmaps\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/register",
				pattern: /^\/register\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
