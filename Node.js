const { exec } = require("child_process");

console.log("Running app container on port 3000...");
exec("docker run -p 3000:3000 my-node-app");

