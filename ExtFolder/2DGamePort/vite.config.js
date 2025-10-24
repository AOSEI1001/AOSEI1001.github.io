
// to be able to export, allows code to run in browser + take the least amount of space 



import { defineConfig } from "vite";

 export default defineConfig({
    base: "./", //not going to be able to find the assets
    build: {
        minify: "terser",

    },
 });