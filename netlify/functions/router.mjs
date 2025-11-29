// router.mjs
export function createRouter() {
    const routes = [];

    function pathToRegex(path) {
        const paramNames = [];

        // Extract all paramNames from the patter
        const pattern = path.replace(/:([A-Za-z0-9_]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
        }).replace(/\//g, '\\/');

        // returns RegExp pattern for matching route and array of paramNames within the route 
        return { regex: new RegExp(`^${pattern}\\/?$`), paramNames };
    }

    // Update routes array
    function add(method, path, handler) {
        const { regex, paramNames } = pathToRegex(path);
        routes.push({ method: method, path, regex, paramNames, handler });
    }

    return {
        get: (p,h) => add('GET', p, h),
        post: (p,h) => add('POST', p, h),
        patch: (p,h) => add('PATCH', p, h),
        delete: (p,h) => add('DELETE', p, h),

        // Function for handling a request
        async handle(req, context) {
            const method = req.method;
            
            // Strips "/.netlify/functions/<functionName>"
            const url = new URL(req.url);
            const path = url.pathname.replace(/^\/\.netlify\/functions/, ""); 
            
            // Find route for the req path and httpMethod
            for (const route of routes) {
                // Check if the current route has the same httpMethod
                if (route.method !== method) 
                    continue;
                // Check with the current route path matches the path
                const match = path.match(route.regex);
                if (!match) continue;

                // Extract the params in the path
                const params = {};
                route.paramNames.forEach((paramName, i) => 
                    params[paramName] = decodeURIComponent(match[i + 1])
                );

                let body = null;
                if (req.body){
                    body = await req.json();
                }
                
                // Delegates business logic to handler for that route
                return route.handler({req, context, params, body});
            }
            return new Response(JSON.stringify({ error: 'Not found' }), { status: 400, headers: { 'content-type': 'application/json' } });
        }
    };
}