'use strict'
var opt = {
    width: 350,
    height: 350,
    wanted: 30,
    force: true,
    scaleDown: 0,
    scaleBase: 100
}

var canvas, ctx;
var c_width, c_height;
var scale_bar, recenter_btn;
var dpi = window.devicePixelRatio;

var cameraOffset = { x: -0.5, y: -0.5 }
var cameraZoom = 1
var MAX_ZOOM = 10
var MIN_ZOOM = 0.1
var SCROLL_SENSITIVITY = 0.0005

// ---------------------------

var user = {
    width: opt.width,
    height: opt.height
}
// }

function roundHalf(num) {
    return Math.round(num*2)/2;
}

function updateCanvas(width, height) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}

function updatePixel(width, height) {    
    canvas.width = width;
    canvas.height = height;
}

// let getPixelRatio = function (context) {
//     let backingStore = context.backingStorePixelRatio ||
//                         context.webkitBackingStorePixelRatio ||
//                         context.mozBackingStorePixelRatio ||
//                         context.msBackingStorePixelRatio ||
//                         context.oBackingStorePixelRatio ||
//                         context.backingStorePixelRatio || 1;
//     return (window.devicePixelRatio || 1) / backingStore;
// };

function fix_dpi() {    
    //get CSS height
    //the + prefix casts it to an integer
    //the slice method gets rid of "px"
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    //get CSS width
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    //scale the canvas
    canvas.setAttribute('height', style_height * dpi);
    canvas.setAttribute('width', style_width * dpi);
}

const SetupCanvas = () => {
    canvas = document.querySelector("#render");
    ctx = canvas.getContext('2d');
    
    //
    c_width.value = c_height.value = opt.wanted;
    //    
    scale_bar.max = opt.scaleBase + opt.scaleDown;    
    
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    user.width = +c_width.value;
    user.height = +c_height.value;

    scale_bar.value = opt.scaleDown;

    ctx.scale( window.devicePixelRatio, window.devicePixelRatio );

    updateCanvas(opt.width + 0.5, opt.height + 0.5);
    
    updatePixel(opt.width + 0.5, opt.height + 0.5);

    tick();
}

const tick = () => {
    fix_dpi();

    ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    ctx.scale(cameraZoom, cameraZoom)
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
    // ctx.clearRect(0,0, window.innerWidth, window.innerHeight)

    doRender();
    drawCircle();
    requestAnimationFrame(tick);
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
    // console.log("===============");

    return {
        sizePerGrid,
        gridSize,
        bestBorder,
        blockWanted
    }
}

const fillBlock = (x, y, color) => {
    const setting = getGridSize();
    let bX = setting.bestBorder + (setting.sizePerGrid - setting.bestBorder/setting.blockWanted) * (x-1);
    let bY = setting.bestBorder + (setting.sizePerGrid - setting.bestBorder/setting.blockWanted) * (y-1);    

    ctx.fillStyle = color;

    let sizeX = setting.gridSize;
    let sizeY = setting.gridSize;
        
    ctx.fillRect(bX, bY, sizeX, sizeY );
}

const doRender = (color) => {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const setting = getGridSize();
    let fx = 0, fy = 0;

    // 创建垂直格网线路径
    for(let i = 0.5 + Math.floor(setting.bestBorder/2), blockindx = 0; blockindx < +setting.blockWanted+1; i += setting.sizePerGrid - setting.bestBorder/setting.blockWanted, blockindx++) {
        fx = Math.floor(i) + 0.5
        fy = Math.floor(setting.sizePerGrid*setting.blockWanted) + 0.5;
        ctx.moveTo(fx, 0);
        ctx.lineTo(fx, fy);
    }

    // 创建水平格网线路径
    for(let j = 0.5 + Math.floor(setting.bestBorder/2), blockindx = 0; blockindx < +setting.blockWanted+1; j += setting.sizePerGrid - setting.bestBorder/setting.blockWanted, blockindx++) {
        fx = Math.floor(setting.sizePerGrid*setting.blockWanted) + 0.5;
        fy = Math.floor(j) + 0.5;
        ctx.moveTo(0, fy);
        ctx.lineTo(fx, fy);
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
        
        // Base
        fillBlock(center.x, center.y, "gray");
        for (let deg = 0; deg < 360; deg += 90) {
            let mX = Math.round(Math.cos(degToRad(deg)));
            let mY = Math.round(Math.sin(degToRad(deg)));
            let offset_x = radius * mX;
            let offset_y = radius * mY;
            let newX = center.x + offset_x;
            let newY = center.y + offset_y;
            fillBlock(newX, newY, "gray");
        }

        let pattern = [];
        // Overlap
        for (let cX = radius-1; cX > 0; cX--) {
            let cY = Math.round(Math.sqrt(radius * radius - cX * cX));            
            pattern.push({cX, cY});
        }
        for (let cY = radius-1; cY > 0; cY--) {
            let cX = Math.round(Math.sqrt(radius * radius - cY * cY));
            pattern.push({cX, cY});
        }
        
        for (let deg = 45; deg < 360; deg += 90) {
            let mX = Math.round(Math.cos(degToRad(deg)));
            let mY = Math.round(Math.sin(degToRad(deg)));
            for (let i = 0; i < pattern.length; i++) {
                let dX = center.x + pattern[i].cX * mX;
                let dY = center.y + pattern[i].cY * mY;
                fillBlock(dX, dY, "red");
            }
        }
    } else {
        let center = {
            x: length/2,
            y: length/2
        }
        let radius = length/2 - 1;
        
        // Base
        for (let i = 0; i < 2; i++)
            fillBlock(center.x+i, center.y, "gray");
        for (let i = 0; i < 2; i++)
            fillBlock(center.x+i, center.y+1, "gray");
            
        for (let deg = 0; deg < 360; deg += 90) {
            let mX = Math.round(Math.cos(degToRad(deg)));
            let mY = Math.round(Math.sin(degToRad(deg)));
            let offset_x = radius * mX;
            let offset_y = radius * mY;
            let newX = center.x + offset_x;
            let newY = center.y + offset_y;

            // Square center patch
            let patch_x = mX;
            let patch_y = mY;

            // Left
            if (mX < 0)
                patch_x++;
            // Top
            if (mY < 0)
                patch_y++;                    

            // Neighbour block
            let next_x = 0;
            let next_y = 0;
            
            // Left
            if (mX < 0)
                next_y++;
            // Right
            if (mX > 0)
                next_y++;
            // Top
            if (mY < 0)
                next_x++;
            // Bottom
            if (mY > 0)
                next_x++;

            const first = {
                x: newX + patch_x,
                y: newY + patch_y
            };
            const second = {
                x: newX + patch_x + next_x,
                y: newY + patch_y + next_y
            };

            fillBlock(first.x, first.y, "gray");
            fillBlock(second.x, second.y, "gray");
        }

        let pattern = [];
        // Overlap
        for (let cX = radius-1; cX > 0; cX--) {
            let cY = Math.round(Math.sqrt(radius * radius - cX * cX));            
            pattern.push({cX, cY});
        }
        for (let cY = radius-1; cY > 0; cY--) {
            let cX = Math.round(Math.sqrt(radius * radius - cY * cY));
            pattern.push({cX, cY});
        }
        
        for (let deg = 45; deg < 360; deg += 90) {
            let mX = Math.round(Math.cos(degToRad(deg)));
            let mY = Math.round(Math.sin(degToRad(deg)));

            // Neighbour block
            let next_x = 0;
            let next_y = 0;

            // Left
            if (mX < 0)
                next_x--;
            // Top
            if (mY < 0)
                next_x++;
            // Bottom
            if (mY > 0) {
                next_x++;
                next_y++;
            }

            for (let i = 0; i < pattern.length; i++) {
                let dX = center.x + next_x + pattern[i].cX * mX;
                let dY = center.y + next_y + pattern[i].cY * mY;
                fillBlock(dX, dY, "red");
            }
        }
    }

}

window.onload = () => {
    c_width = document.querySelector("#c-width");
    c_height = document.querySelector("#c-height");
    recenter_btn = document.querySelector("#recenter-btn");
    scale_bar = document.querySelector("#c-scale");
    
    SetupCanvas();

    // Gets the relevant location from a mouse or single touch event
    function getEventLocation(e)
    {
        if (e.touches && e.touches.length == 1)
        {
            return { x:e.touches[0].clientX, y: e.touches[0].clientY }
        }
        else if (e.clientX && e.clientY)
        {
            return { x: e.clientX, y: e.clientY }        
        }
    }

    function drawRect(x, y, width, height)
    {
        ctx.fillRect( x, y, width, height )
    }

    function drawText(text, x, y, size, font)
    {
        ctx.font = `${size}px ${font}`
        ctx.fillText(text, x, y)
    }

    let isDragging = false
    let dragStart = { x: 0, y: 0 }

    function onPointerDown(e)
    {
        isDragging = true
        dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
        dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
    }

    function onPointerUp(e)
    {
        isDragging = false
        initialPinchDistance = null
        lastZoom = cameraZoom
    }

    function onPointerMove(e)
    {
        if (isDragging)
        {
            cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
            cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
        }
    }

    function handleTouch(e, singleTouchHandler)
    {
        if ( e.touches.length == 1 )
        {
            singleTouchHandler(e)
        }
        else if (e.type == "touchmove" && e.touches.length == 2)
        {
            isDragging = false
            handlePinch(e)
        }
    }

    let initialPinchDistance = null
    let lastZoom = cameraZoom

    function handlePinch(e)
    {
        e.preventDefault()
        
        let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
        
        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
        
        if (initialPinchDistance == null)
        {
            initialPinchDistance = currentDistance
        }
        else
        {
            adjustZoom( null, currentDistance/initialPinchDistance )
        }
    }

    function adjustZoom(zoomAmount, zoomFactor)
    {
        if (!isDragging)
        {
            if (zoomAmount)
            {
                cameraZoom -= zoomAmount
            }
            else if (zoomFactor)
            {
                console.log(zoomFactor)
                cameraZoom = zoomFactor*lastZoom
            }
            
            cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
            cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
            
            //console.log(zoomAmount)
        }
    }

    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

    const rescale = () => {
        const scale_input = scale_bar.value;
        console.log(scale_input)

        let newValue = 1 + (scale_input - opt.scaleDown) / 100;
        // Keep 3 decimal places
        newValue = Math.floor(newValue * 1000) / 1000;

        // Update Scale bar title hint
        scale_bar.title = newValue;

        // Assign ratio scale
        let newSize = opt.width * newValue;
        
        updateCanvas(newSize, newSize);
    }

    c_width.onchange = c_height.onchange = (e) => {
        const newLength = e.target.value;
        if (newLength < 1)
            e.target.value = 1;
        
        c_width.value = newLength;
        c_height.value = newLength;

        if (opt.force) {
            user.width = newLength;
            user.height = newLength;
            
            let newRatio = ((opt.scaleBase / 100) + newLength / opt.width * 2) * 100;
            newRatio = roundHalf(newRatio);
            scale_bar.max = newRatio;
            
            rescale();
        }
    }    

    scale_bar.oninput = rescale;

    recenter_btn.onclick = () => {
        cameraOffset = { x: -0.5, y: -0.5 }
        cameraZoom = 1
    }
}