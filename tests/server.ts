export async function startServer() {
    const server = Bun.serve({
        development: true,
        port: 3002,
        routes: {
            "/e.js": new Response(await Bun.file("./e.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/static-render": new Response(await Bun.file("./tests/static-render.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/static-render.js": new Response(await Bun.file("./tests/static-render.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/dynamic-component": new Response(await Bun.file("./tests/dynamic-component.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/dynamic-component.js": new Response(await Bun.file("./tests/dynamic-component.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/dynamic-type": new Response(await Bun.file("./tests/dynamic-type.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/dynamic-type.js": new Response(await Bun.file("./tests/dynamic-type.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/dynamic-attributes": new Response(await Bun.file("./tests/dynamic-attributes.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/dynamic-attributes.js": new Response(await Bun.file("./tests/dynamic-attributes.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),
        }
    })
    console.info('Serving on port 3002...')
    return server
}

if (process.env.START_SERVER === 'true') startServer()
