const app = require("./src/app");
const PORT = process.env.PORT || 3055;

const server = app.listen(PORT, () => {
    console.log(`Closing-server start with ${PORT}`);
    console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});

process.on("SIGINT", () => {
    console.log("Closing server...");
    server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
    });
});
