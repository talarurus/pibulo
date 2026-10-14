// Studio consumes the same public package exports as external applications.
// Build those entries before bundling the website, including on a fresh checkout.
await import('../../scripts/build.mjs');
const {startServer}=await import('./server.mjs');
startServer(Number(process.env.PORT)||4318);
