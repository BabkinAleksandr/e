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

            "/dynamic-children": new Response(await Bun.file("./tests/dynamic-children.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/dynamic-children.js": new Response(await Bun.file("./tests/dynamic-children.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/event-listeners": new Response(await Bun.file("./tests/event-listeners.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/event-listeners.js": new Response(await Bun.file("./tests/event-listeners.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/memory-performance": new Response(await Bun.file("./tests/memory-performance.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/memory-performance.js": new Response(await Bun.file("./tests/memory-performance.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/edge-cases": new Response(await Bun.file("./tests/edge-cases.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/edge-cases.js": new Response(await Bun.file("./tests/edge-cases.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/error-boundary": new Response(await Bun.file("./tests/error-boundary.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/error-boundary.js": new Response(await Bun.file("./tests/error-boundary.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/refs": new Response(await Bun.file("./tests/refs.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/refs.js": new Response(await Bun.file("./tests/refs.js").bytes(), {
                headers: {
                    "Content-Type": "text/javascript"
                }
            }),

            "/lifecycles": new Response(await Bun.file("./tests/lifecycles.html").bytes(), {
                headers: {
                    "Content-Type": "text/html"
                }
            }),

            "/lifecycles.js": new Response(await Bun.file("./tests/lifecycles.js").bytes(), {
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
