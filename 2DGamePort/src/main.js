import { kaboomObj } from "./kaboomCtx";

// loads the sprites name, source, how to slice it
kaboomObj.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39, //number of frames: 624/16
    sliceY: 31, // 496/16

    // link names to specifc animations
    anims: {
        "idle-down": 936,

        // starting frame, finishing frame 
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },

        "idle-side": 975,

        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },

        "idle-up": 1014,

        "walk-up": {from: 1014, to: 1017, loop: true, speed: 8 },
    },
});


