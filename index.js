var opt = {
    width: 500,
    height: 500,
    force: true,
    scale: 1,
}

var canvas, ctx;
var c_width, c_height;

// ---------------------------

var user = {
    width: opt.width,
    height: opt.height
}
// }

function updateCanvas(width, height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

function updatePixel(width, height) {    
    canvas.width = width;
    canvas.height = height;
}

const SetupCanvas = () => {
    canvas = document.querySelector("#render");
    ctx = canvas.getContext('2d');

    user.width = parseInt(c_width.value);
    user.height = parseInt(c_height.value);    

    ctx.scale( window.devicePixelRatio , window.devicePixelRatio );

    updateCanvas(opt.width+0.5, opt.height+0.5);
    
    updatePixel(opt.width+0.5, opt.height+0.5);

    tick();
}

const tick = () => {
    requestAnimationFrame(tick);
    doRender();
    drawCircle();
}

const getDesireBlock = () => {
    return user.width > user.height ? user.width : user.height;
}

const getGridSize = () => {
    const cssSize = canvas.width;

    const blockWanted = getDesireBlock();
    const sizePerGrid = cssSize / blockWanted;

    const bestBorder = sizePerGrid * 0.05;

    const remainSize = cssSize - (bestBorder) * (blockWanted);
    
    const gridSize = remainSize / blockWanted;

    // console.log("Canvas css size:", cssSize);
    // console.log("Blocks wanted:", blockWanted);    
    // console.log("Remain size:", remainSize)
    // console.log("How big a block consume:", sizePerGrid);
    // console.log("Best border length:", bestBorder);
    // console.log("Best block size:", gridSize);

    return {
        sizePerGrid,
        gridSize,
        bestBorder,
        blockWanted
    }
}

const fillBlock = (x, y) => {
    const setting = getGridSize();
    const bX = setting.bestBorder + (setting.sizePerGrid - setting.bestBorder/setting.blockWanted) * (x-1);
    const bY = setting.bestBorder + (setting.sizePerGrid - setting.bestBorder/setting.blockWanted) * (y-1);

    ctx.fillStyle = "gray";
    ctx.fillRect(bX, bY, setting.gridSize, setting.gridSize );
}

const doRender = (color) => {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const setting = getGridSize();

    // 创建垂直格网线路径
    for(let i = setting.bestBorder/2, blockindx = 0; blockindx < setting.blockWanted+1; i += setting.sizePerGrid - setting.bestBorder/setting.blockWanted, blockindx++){        
        ctx.moveTo(i, 0);
        ctx.lineTo(i, setting.sizePerGrid*setting.blockWanted);
    }
    // 创建水平格网线路径
    for(let j = setting.bestBorder/2, blockindx = 0; blockindx < setting.blockWanted+1; j += setting.sizePerGrid - setting.bestBorder/setting.blockWanted, blockindx++){
        ctx.moveTo(0, j);
        ctx.lineTo(setting.sizePerGrid*setting.blockWanted, j);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = setting.bestBorder;
    ctx.stroke();
    ctx.beginPath();
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

const drawCircle = () => {
    let length = user.width;
    // If length is odd, choose one block middle
    // If length is even, split width into half    
    if (length % 2 != 0) {
        let center = {
            x: Math.round(length/2),
            y: Math.round(length/2)
        }
        let radius = Math.floor(length/2);
        // let pattern = [];
        // for (let cX = length; cX > 0; cX--) {
        //     let cY = Math.round(length*length / cX*cX);
        //     pattern.push(cX, cY);
        // }
        // let topRight = {
        //     x: center.x + radius,
        //     y: 0,
        //     dirX: -1,
        //     dirY: -1
        // }
        // for (let i = length; i > 0; i--) {
        //     let nextY = pattern[i+1];
        //     for (let dY = topRight.y; dY < nextY; dY += topRight.dirY) {
        //         let dX = center.x + pattern;
        //         let dY = center.y + pattern[i];
        //         ctx.fillRect( dX, dY, 1, 1 );
        //     }
        // }
        for (let deg = 0; deg < 360; deg += 90) {
            let mX = Math.round(Math.cos(degToRad(deg)));
            let mY = Math.round(Math.sin(degToRad(deg)));
            let offset_x = radius * mX;
            let offset_y = radius * mY;
            let newX = center.x + offset_x;
            let newY = center.y + offset_y;
            fillBlock(newX, newY);
        }
    }

}

window.onload = () => {
    const submit_btn = document.querySelector("#submit-btn");
    c_width = document.querySelector("#c-width");
    c_height = document.querySelector("#c-height");
    const recenter_btn = document.querySelector("#recenter-btn");
    const scale_bar = document.querySelector("#c-scale");
    
    SetupCanvas();
    //drawCircle(51);

    //drawGrid(1, 1, 'lightgray', 0.5);
    //ctx.scale(25, 25)    

    // submitBtn.addEventListener("click", () => {
    //     let radius = submitCtx.value;

    //     const DrawCircle = (x, y, r, color) => {
    //         const PI = 3.1415926535;
    //         let i, angle, x1, y1;

    //         for(i = 0; i < 360; i += 0.1)
    //         {
    //                 angle = i;
    //                 x1 = r * Math.cos(angle * PI / 180);                    
    //                 y1 = r * Math.sin(angle * PI / 180);
    //                 console.log(x1, y1);
    //                 //putpixel(x + x1, y + y1, color);
    //         }
    //     }
    //     DrawCircle(0, 0, 10);
    // })

    // let ctx = canvas.getContext('2d')

    // let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
    // let cameraZoom = 1
    // let MAX_ZOOM = 5
    // let MIN_ZOOM = 0.1
    // let SCROLL_SENSITIVITY = 0.0005

    // function draw()
    // {
    //     canvas.width = window.innerWidth
    //     canvas.height = window.innerHeight
        
    //     // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    //     ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    //     ctx.scale(cameraZoom, cameraZoom)
    //     ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
    //     ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
        

    //     const PI = 3.1415926535;
    //     let x = 0, y = 0, r = 500;
    //     let i, angle, x1, y1;

    //     for(i = 0; i < 360; i += 0.1)
    //     {
    //             angle = i;
    //             x1 = r * Math.cos(angle * PI / 180);
    //             y1 = r * Math.sin(angle * PI / 180);
    //             ctx.fillRect(x + x1, y + y1, 1, 1);
    //     }
        
    //     requestAnimationFrame( draw )
    // }

    // // Gets the relevant location from a mouse or single touch event
    // function getEventLocation(e)
    // {
    //     if (e.touches && e.touches.length == 1)
    //     {
    //         return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    //     }
    //     else if (e.clientX && e.clientY)
    //     {
    //         return { x: e.clientX, y: e.clientY }        
    //     }
    // }

    // function drawRect(x, y, width, height)
    // {
    //     ctx.fillRect( x, y, width, height )
    // }

    // function drawText(text, x, y, size, font)
    // {
    //     ctx.font = `${size}px ${font}`
    //     ctx.fillText(text, x, y)
    // }

    // let isDragging = false
    // let dragStart = { x: 0, y: 0 }

    // function onPointerDown(e)
    // {
    //     isDragging = true
    //     dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    //     dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
    // }

    // function onPointerUp(e)
    // {
    //     isDragging = false
    //     initialPinchDistance = null
    //     lastZoom = cameraZoom
    // }

    // function onPointerMove(e)
    // {
    //     if (isDragging)
    //     {
    //         cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
    //         cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    //     }
    // }

    // function handleTouch(e, singleTouchHandler)
    // {
    //     if ( e.touches.length == 1 )
    //     {
    //         singleTouchHandler(e)
    //     }
    //     else if (e.type == "touchmove" && e.touches.length == 2)
    //     {
    //         isDragging = false
    //         handlePinch(e)
    //     }
    // }

    // let initialPinchDistance = null
    // let lastZoom = cameraZoom

    // function handlePinch(e)
    // {
    //     e.preventDefault()
        
    //     let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    //     let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
        
    //     // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    //     let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
        
    //     if (initialPinchDistance == null)
    //     {
    //         initialPinchDistance = currentDistance
    //     }
    //     else
    //     {
    //         adjustZoom( null, currentDistance/initialPinchDistance )
    //     }
    // }

    // function adjustZoom(zoomAmount, zoomFactor)
    // {
    //     if (!isDragging)
    //     {
    //         if (zoomAmount)
    //         {
    //             cameraZoom -= zoomAmount
    //         }
    //         else if (zoomFactor)
    //         {
    //             console.log(zoomFactor)
    //             cameraZoom = zoomFactor*lastZoom
    //         }
            
    //         cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
    //         cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
            
    //         console.log(zoomAmount)
    //     }
    // }

    // canvas.addEventListener('mousedown', onPointerDown)
    // canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    // canvas.addEventListener('mouseup', onPointerUp)
    // canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
    // canvas.addEventListener('mousemove', onPointerMove)
    // canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    // canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

    // // Ready, set, go
    // draw()

    c_width.onchange = c_height.onchange = (e) => {
        let rad = e.target.value;
        if (rad < 1)
            e.target.value = 1;

        if (opt.force) {
            user.width = parseInt(c_width.value);            
            user.height = user.width;
        }

        //user.width = parseInt(c_width.value);
        //let g_height = parseInt(c_width.value);
    }

    scale_bar.oninput = (e) => {
        const scale_input = e.target.value;

        let newScale = 1 + scale_input/100;

        // Update UI
        e.target.title = newScale;

        let newSize = opt.width * newScale;

        updateCanvas(newSize, newSize);
    }

    recenter_btn.onclick = () => {
        ctx.scale(1, 1);
    }
}