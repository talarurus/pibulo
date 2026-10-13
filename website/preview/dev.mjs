await import('./build.mjs');
const {startServer}=await import('./server.mjs');
startServer(Number(process.env.PORT)||4318);
