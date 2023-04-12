import App from "./App/App.js"

const app = new App(document.querySelector('canvas.webgl'), {
    enableAxesHelper: true,
    images: [
        "img/adidas2.png",
        // "img/sinking.png"
    ]
})