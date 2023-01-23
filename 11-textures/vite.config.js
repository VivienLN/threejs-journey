const isCodeSandbox = !!process.env.SANDBOX_URL

export default {
    root: "src/",
    publicDir: "../static/",
    base: "./",
    server:
    {
        host: true,
        port: 5173,
        // For docker: polling
        watch: {
          usePolling: true
        },
        // For docker: set to false
        open: false
        // open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: "../dist",
        emptyOutDir: true,
        sourcemap: true
    }
    
}