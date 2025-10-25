import { scaleFactor } from "./constants";
import { kaboomObj } from "./kaboomCtx";
import { displayDialogue } from "./utils";

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

kaboomObj.loadSprite("map", "./map.png");

kaboomObj.setBackground(kaboomObj.Color.fromHex("#311047"));

// use async for the functions it provides/allows 
// await allows to wait for fully loaded map data, converts tp json file
kaboomObj.scene("main", async () =>{
    const mapData = await (await fetch("./map.json")).json()

    const layers = mapData.layers;

    // first game object --> object that contains different components 
    const map = kaboomObj.make([
        kaboomObj.sprite("map"),
        kaboomObj.pos(0), // where on the screene it will be displayed
        kaboomObj.scale(scaleFactor)
    ]); // makes it, but does not add to the scene

    // player game object 
    const player = kaboomObj.make([
        kaboomObj.sprite("spritesheet",{anim: "idle-down"}),
        // creates hit box
        kaboomObj.area({
            // hit box will be drawn from the origin to 
            shape: new kaboomObj.Rect(kaboomObj.vec2(0, 3), 10, 10)
        }),
        // makes the player a physics object done by kaboom
        kaboomObj.body(),
        kaboomObj.anchor("center"),
        kaboomObj.pos(),
        kaboomObj.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,

        },

        "player"

    ]);

// searching through layers
    for (const layer of layers){
        if(layer.name === "boundaries"){
            for(const boundry of layer.objects){
                // adding children 
                map.add([
                    kaboomObj.area({
                        shape: new kaboomObj.Rect(kaboomObj.vec2(0), boundry.width, boundry.height),
                    }),
// the player wont be able to pass over the body/ walls 
                    kaboomObj.body({isStatic: true}),

                    kaboomObj.pos(boundry.x, boundry.y),

                    boundry.name,
                ]);

                // setting the oncollide events
                if(boundry.name){
                    player.onCollide(boundry.name, () => {
                        // prevnts player from moving when text is dispalyed
                        player.isInDialogue = true;

                        // TODO

                        displayDialogue(
                            dialogueData[boundry.name],
                            () => (player.isInDialogue = false)
                        );
                    });
                }
            }

            continue;
        }

        if(layer.name === "spawnpoints"){
            for(const entity of layer.objects){
                if(entity.name === "player"){
                    player.pos = kaboomObj.vec2(
                    (map.pos.x + entity.x) * scaleFactor,
                    (map.pos.y + entity.y) * scaleFactor,
                    
                );

                kaboomObj.add(player);
                continue;

                }  
            }
        }
    }

    setCamScale(kaboomObj);

    kaboomObj.onResize(() => {
        setCamScale(kaboomObj);

    });

    kaboomObj.onUpdate(() => {
        kaboomObj.camPos(player.worldPos().x, player.worldPos().y - 100);
    });

    kaboomObj.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;

        const worldMousePos = kaboomObj.toWorld(kaboomObj.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos);

        const lowerBound = 50;
        const upperBound = 125;

        if (
        mouseAngle > lowerBound &&
        mouseAngle < upperBound &&
        player.curAnim() !== "walk-up"
        ) {
        player.play("walk-up");
        player.direction = "up";
        return;
        }

        if (
        mouseAngle < -lowerBound &&
        mouseAngle > -upperBound &&
        player.curAnim() !== "walk-down"
        ) {
        player.play("walk-down");
        player.direction = "down";
        return;
        }

        if (Math.abs(mouseAngle) > upperBound) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        return;
        }

        if (Math.abs(mouseAngle) < lowerBound) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        return;
        }
    });


    function stopAnims(){
        if(player.direction === "down"){
            player.play("idle-down");

            return;
        }

        if(player.direction === "up"){
            player.play("idle-up");

            return;
        }

        player.play("idle-side");
    }


    kaboomObj.onMouseRelease(stopAnims);

    kaboomObj.onKeyRelease(() => {
        stopAnims();

    });

    kaboomObj.onKeyDown((key) => {
    const keyMap = [
            k.isKeyDown("right"),
            k.isKeyDown("left"),
            k.isKeyDown("up"),
            k.isKeyDown("down"),
        ];

        let nbOfKeyPressed = 0;
        for (const key of keyMap) {
            if (key) {
                nbOfKeyPressed++;
            }
        }

        if (nbOfKeyPressed > 1) return;

        if (player.isInDialogue) return;

        if (keyMap[0]) {
            player.flipX = false;

        if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "right";
            player.move(player.speed, 0);
            return;
        }

        if (keyMap[1]) {
            player.flipX = true;

        if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "left";
            player.move(-player.speed, 0);
            return;
        }

        if (keyMap[2]) {
            if (player.curAnim() !== "walk-up") player.play("walk-up");
            player.direction = "up";
            player.move(0, -player.speed);
            return;
        }

        if (keyMap[3]) {
            if (player.curAnim() !== "walk-down") player.play("walk-down");
            player.direction = "down";
            player.move(0, player.speed);
        }
    });
});

// default scene
kaboomObj.go("main");