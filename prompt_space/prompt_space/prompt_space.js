(function () {
    var BOX_HEIGHT = 24;
    var BORDER_WEIGHT = 1;
    var SCROLL_SPEED = 50;
    var messageArea;
    var inputRow;
    var maxBubbleWidth;

    function init() {
        var space = document.getElementById("prompt-space");
        messageArea = document.getElementById("message-area");
        inputRow = document.getElementById("input-row");

        var availableWidth = space.clientWidth - BOX_HEIGHT;
        maxBubbleWidth = availableWidth - 2 * BOX_HEIGHT;

        createInputBubble(availableWidth);
    }

    function addMessage(text, sender) {
        var variant = sender === "machine" ? 2 : 1;

        var textWidth = measureTextWidth(text);
        var bubbleWidth = Math.min(Math.ceil(textWidth), maxBubbleWidth);
        var isOverflowing = textWidth > maxBubbleWidth;
        var totalWidth = bubbleWidth + 2 * BOX_HEIGHT;

        var row = document.createElement("div");
        row.className = "message-row " + sender;

        var container = document.createElement("div");
        container.className = "bubble-container";
        container.style.width = totalWidth + "px";
        container.style.height = BOX_HEIGHT + "px";

        container.appendChild(createBubbleSVG(bubbleWidth, BOX_HEIGHT, variant));

        var textDiv = document.createElement("div");
        textDiv.className = "bubble-text";
        textDiv.style.left = BOX_HEIGHT + "px";
        textDiv.style.top = "0";
        textDiv.style.width = bubbleWidth + "px";
        textDiv.style.height = BOX_HEIGHT + "px";

        var textSpan = document.createElement("span");
        textSpan.className = "bubble-text-content";
        textSpan.textContent = text;
        textDiv.appendChild(textSpan);

        if (isOverflowing) {
            var ellipsis = document.createElement("span");
            ellipsis.className = "bubble-ellipsis";
            ellipsis.textContent = "...";
            textDiv.appendChild(ellipsis);
            setupHoverScroll(textDiv, textSpan, ellipsis, bubbleWidth);
        }

        container.appendChild(textDiv);
        row.appendChild(container);
        messageArea.appendChild(row);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    Object.prototype.translate = function (x, y) {
        var point = [...this]
        point[0] += x;
        point[1] += y;

        return point;
    }

    function createBubbleSVG(width, height, variant) {
        var BOX = BOX_HEIGHT
        var HEIGHT = Math.ceil(height / BOX_HEIGHT) * BOX_HEIGHT * 2;
        var WIDTH = width;
        var ns = "http://www.w3.org/2000/svg";

        var svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", WIDTH + 2 * HEIGHT);
        svg.setAttribute("height", HEIGHT);
        svg.setAttribute("overflow", "visible");
        svg.style.display = "block";

        var topLeft = [0, 0]
        var topRight = [BOX, 0]
        var bottomLeft = [0, BOX]
        var bottomRight = [BOX, BOX]

        var lines = [
            [...topRight, ...topRight.translate(WIDTH, 0), true],
            [...bottomRight.translate(0, BOX), ...bottomRight.translate(WIDTH, BOX), true],
            [...topLeft, ...topLeft.translate(0, HEIGHT - BOX), variant == 1],
            [...bottomLeft, ...bottomLeft.translate(0, HEIGHT - BOX), variant == 2],
            [...topLeft, ...topRight, variant === 1],
            [...bottomLeft, ...bottomRight, variant === 2],
            [...topLeft.translate(WIDTH, 0), ...topRight.translate(WIDTH, 0), variant === 2],
            [...bottomLeft.translate(WIDTH + BOX, 0), ...bottomRight.translate(WIDTH + BOX, 0), variant === 1],
            [...topLeft, ...bottomRight, variant === 1],
            [...bottomRight, ...topRight, variant === 2],
            [...topLeft.translate(WIDTH + BOX, 0), ...bottomRight.translate(WIDTH + BOX, 0), variant === 1],
            [...bottomRight.translate(WIDTH + BOX, 0), ...topRight.translate(WIDTH + BOX, 0), variant === 2],
        ]

        var points = [[BOX, BOX]]
        points.addPoint(BOX + WIDTH, 0)
        points.addPoint(-BOX, -BOX)
        points.addPoint(-WIDTH - BOX, 0)
        points.addPoint(BOX, BOX)

        var shape = createShape(points)
        lines = shape

        for (var i = 0; i < lines.length; i++) {
            console.log(lines[i])
            var d = lines[i];
            var line = document.createElementNS(ns, "line");
            line.setAttribute("x1", d[0]);
            line.setAttribute("y1", d[1]);
            line.setAttribute("x2", d[2]);
            line.setAttribute("y2", d[3]);
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", BORDER_WEIGHT);
            //if (!d[4]) line.style.display = "none";
            svg.appendChild(line);
        }

        return svg;
    }

    function createShape(points) {
        var lines = []
        var p1 = points[0]

        for (var i = 1; i < points.length; i++) {
            var p2 = points[i]
            var line = [...p1, ...p2]
            lines.push(line)
            p1 = p2
        }

        return lines
    }

    Object.prototype.addPoint = function (x, y) {
        var point = [...this[this.length - 1]]
        point[0] += x
        point[1] += y
        this.push(point)
    }

    function measureTextWidth(text) {
        var el = document.createElement("span");
        el.style.cssText = "font-size:16px;position:absolute;visibility:hidden;white-space:nowrap;";
        el.textContent = text;
        document.body.appendChild(el);
        var w = el.offsetWidth;
        document.body.removeChild(el);
        return w;
    }

    function setupHoverScroll(container, textSpan, ellipsis, bubbleWidth) {
        var frameId = null;
        var pos = 0;
        var returning = false;

        container.addEventListener("mouseenter", function () {
            ellipsis.style.display = "none";
            var overflow = textSpan.offsetWidth - bubbleWidth;
            if (overflow <= 0) return;
            pos = 0;
            returning = false;

            function step() {
                if (!returning) {
                    pos += SCROLL_SPEED / 60;
                    if (pos >= overflow) {
                        pos = overflow;
                        returning = true;
                    }
                } else {
                    pos -= SCROLL_SPEED / 60;
                    if (pos <= 0) {
                        pos = 0;
                        returning = false;
                    }
                }
                textSpan.style.transform = "translateX(" + -pos + "px)";
                frameId = requestAnimationFrame(step);
            }

            frameId = requestAnimationFrame(step);
        });

        container.addEventListener("mouseleave", function () {
            if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            pos = 0;
            textSpan.style.transform = "translateX(0)";
            ellipsis.style.display = "";
        });
    }

    function createInputBubble(availableWidth) {
        var inputWidth = availableWidth - BOX_HEIGHT;
        var totalWidth = availableWidth;

        var container = document.createElement("div");
        container.className = "bubble-container";
        container.style.width = totalWidth + "px";
        container.style.height = BOX_HEIGHT + "px";

        var bubbleSVG = createBubbleSVG(inputWidth, BOX_HEIGHT, 1)
        container.appendChild(bubbleSVG);

        var input = document.createElement("input");
        input.type = "text";
        input.className = "input-textbox";
        input.style.left = BOX_HEIGHT + "px";
        input.style.top = "0";
        input.style.width = inputWidth + "px";
        input.style.height = BOX_HEIGHT + "px";
        input.style.lineHeight = BOX_HEIGHT + "px";

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && input.value.trim()) {
                addMessage(input.value.trim(), "user");
                input.value = "";
            }
        });

        container.appendChild(input);
        inputRow.appendChild(container);
    }

    window.addMessage = addMessage;
    document.addEventListener("DOMContentLoaded", init);
})();
