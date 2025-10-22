import kaboom from "kaboom";

export const kaboomObj = kaboom({
    global: false,

    touchToMouse: true, //write code with mouse in mind but the program simply converts the mouse to touch mobile

    canvas: document.getElementById("game"),
});