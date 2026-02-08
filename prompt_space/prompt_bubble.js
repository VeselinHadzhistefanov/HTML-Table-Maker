(function () {
    var BOX_HEIGHT = 24;
    var bubbleWidth = 200;
    var borderWeight = 1;
    var currentVariant = 1;

    function setBubbleWidth(width) {
        bubbleWidth = width;
        render();
    }

    function setBorderWeight(weight) {
        borderWeight = weight;
        render();
    }

    function setVariant(variant) {
        currentVariant = variant;
        render();
    }

    function render() {
        var H = BOX_HEIGHT;
        var W = bubbleWidth;
        var totalWidth = W + 2 * H;

        var svg = document.getElementById("bubble-frame");
        svg.setAttribute("width", totalWidth);
        svg.setAttribute("height", H);

        var lines = svg.querySelectorAll("line");
        for (var i = 0; i < lines.length; i++) {
            lines[i].setAttribute("stroke-width", borderWeight);
        }

        setLine("border-top", H, 0, H + W, 0);
        setLine("border-bottom", H, H, H + W, H);
        setLine("border-ext-tl", 0, 0, H, 0);
        setLine("border-ext-tr", H + W, 0, 2 * H + W, 0);
        setLine("border-ext-bl", 0, H, H, H);
        setLine("border-ext-br", H + W, H, 2 * H + W, H);
        setLine("diagonal-1", 0, 0, H, H);
        setLine("diagonal-2", H, 0, 0, H);
        setLine("diagonal-3", H + W, 0, 2 * H + W, H);
        setLine("diagonal-4", H + W, H, 2 * H + W, 0);

        if (currentVariant === 1) {
            setVisible("border-ext-tl", true);
            setVisible("border-ext-tr", false);
            setVisible("border-ext-bl", false);
            setVisible("border-ext-br", true);
            setVisible("diagonal-1", true);
            setVisible("diagonal-2", false);
            setVisible("diagonal-3", true);
            setVisible("diagonal-4", false);
        } else {
            setVisible("border-ext-tl", false);
            setVisible("border-ext-tr", true);
            setVisible("border-ext-bl", true);
            setVisible("border-ext-br", false);
            setVisible("diagonal-1", false);
            setVisible("diagonal-2", true);
            setVisible("diagonal-3", false);
            setVisible("diagonal-4", true);
        }

        var textbox = document.getElementById("bubble-textbox");
        textbox.style.left = H + "px";
        textbox.style.top = "0px";
        textbox.style.width = W + "px";
        textbox.style.height = H + "px";
    }

    function setLine(id, x1, y1, x2, y2) {
        var el = document.getElementById(id);
        el.setAttribute("x1", x1);
        el.setAttribute("y1", y1);
        el.setAttribute("x2", x2);
        el.setAttribute("y2", y2);
    }

    function setVisible(id, visible) {
        var el = document.getElementById(id);
        el.style.display = visible ? "" : "none";
    }

    window.setBubbleWidth = setBubbleWidth;
    window.setBorderWeight = setBorderWeight;
    window.setVariant = setVariant;

    document.addEventListener("DOMContentLoaded", render);
})();
