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
        var isOverflowing = textWidth > maxBubbleWidth;

        var bubbleWidth = Math.min(Math.ceil(textWidth), maxBubbleWidth);
        var bubbleHeight = isOverflowing ? BOX_HEIGHT * 2 : BOX_HEIGHT

        var totalWidth = bubbleWidth + 2 * BOX_HEIGHT;

        var row = document.createElement("div");
        row.className = "message-row " + sender;

        var container = document.createElement("div");
        container.className = "bubble-container";
        container.style.width = totalWidth + "px";
        container.style.height = bubbleHeight + "px";

        container.appendChild(createBubbleSVG(bubbleWidth, bubbleHeight, variant));

        var textDiv = document.createElement("div");
        textDiv.className = "bubble-text";
        textDiv.style.left = BOX_HEIGHT + "px";
        textDiv.style.top = "0";
        textDiv.style.width = bubbleWidth + "px";
        textDiv.style.height = bubbleHeight + "px";

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

    function createBubbleSVG(width, height, direction) {
        var ns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", width + 2 * height);
        svg.setAttribute("height", height);
        svg.setAttribute("overflow", "visible");
        svg.style.display = "block";

        let shape = new Shape()

        // Draw top cap
        if (direction == 1) {
            shape.beginShape(0, 0)
            shape.offset(width + BOX_HEIGHT, 0)
            shape.offset(BOX_HEIGHT, BOX_HEIGHT)
            shape.offset(0, height - BOX_HEIGHT, true)
            shape.offset(-width -BOX_HEIGHT, 0)
            shape.offset(-BOX_HEIGHT, -BOX_HEIGHT)
            shape.offset(0, -(height - BOX_HEIGHT), true)
        } else {
            shape.beginShape(BOX_HEIGHT, 0)
            shape.offset(0, height - BOX_HEIGHT, true)
            shape.offset(width + BOX_HEIGHT, 0)
            shape.offset(-BOX_HEIGHT, BOX_HEIGHT)
            shape.offset(-width -BOX_HEIGHT, 0)
            shape.offset(BOX_HEIGHT, -BOX_HEIGHT)
        }

        var lines = shape.get()

        for (var i = 0; i < lines.length; i++) {
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

    class Shape {
        constructor() {
            this.points = []
            this.lines = []
        }

        beginShape(x, y) {
            this.points.push([x, y])
        }

        addLine(idx1, idx2) {
            let p1 = this.points[idx1]
            let p2 = this.points[idx2]
            let line = [p1[0], p1[1], p2[0], p2[1]]
            this.lines.push(line)
        }

        offset(x, y, draw = true) {
            var idx = this.points.length - 1
            var p = [this.points[idx][0] + x, this.points[idx][1] + y]
            this.points.push(p)
            if(draw){
                this.addLine(this.points.length - 1, this.points.length - 2)
            }
        }

        get() {
            if (this.lines.length == 0) {
                return null
            }
            return this.lines
        }
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
