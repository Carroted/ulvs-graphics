class Component {
  constructor(x, y, width, height, scale) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.scaleCoords = this.scaleCoords;
    this.isComponent = true;
    this.ox = this.x; // store original x and y
    this.oy = this.y;

    this.elements = []; // the array containing every sub-element of this component:
    /*
    structure:
    [
      {
        element: a variable containing the element, can be anything
        render: a function that gets called to create the html element. Must return a valid HTML Node; parameter: the element that will be rendered
      }
    ]
    */

    this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg"); // the container
    this.container.style.overflow = "overlay";
    this.updateAttributes();

    return this;
  }
  updateAttributes() { // variable attributes
    this.tw = this.width * this.scale; // true width: the width when the proper scale is applied
    this.th = this.height * this.scale; // same as tw but with height

    /*if (this.scaleCoords) { // do the same for coords like for height if scalable
      this.x = this.ox * this.scale;
      this.y = this.oy * this.scale;
    } else {
      this.x = this.ox;
      this.y = this.oy;
    }*/

    this.container.setAttribute("x", this.x);
    this.container.setAttribute("y", this.y);
  }
  updateChildren() {
    this.elements.forEach((elem) => {
      (!elem.update) ? elem.element.update(this) : elem.update(elem.element, this);
    });
  }

  setPosition(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.updateAttributes();
    return pos;
  }
  createSVGElement() { // create the whole svg element and return it
    this.container.innerHTML = "";
    this.elements.forEach((elem) => { // loop through each sub-element
      const rendered = (!elem.render) ? elem.createSVGElement(elem.element) : elem.render(elem.element); // and call the render function
      if (Array.isArray(rendered)) {
        this.container.append(...rendered);
      } else {
        this.container.append(rendered);
      }
    });
    return this.container;
  }
}
class OutputPlugComponent extends Component {
  static Type = {
    BOOLEAN: "bool",
    CONNECTOR: "connect"
  }
  constructor(x, y, width, height, scale, type) {
    super(x, y, width, height, scale);

    this.type = type;

    this.oCircle = new Circle(20 * this.scale, 0, 8 * this.scale, true); // the white circle
    this.oCircle.setColor("white");
    this.elements.push({ element: this.oCircle, render: (el) => el.createSVGElement() });

    this.oT = new RoundedTriangleComponent(0, -1 * this.scale, 90, 1 * this.scale); // the white triangle
    this.oT.setColor("white");
    this.elements.push({ element: this.oT, render: (el) => el.createSVGElement() });

    return this;
  }
  setSubComponentAttributes() { // update sub-elements
    this.oCircle.setPosition({
      x: 20 * this.scale,
      y: 0
    });
    this.oT.setPosition({
      x: 0,
      y: -1 * this.scale
    });
    this.oCircle.radius = 8 * this.scale;
    this.oT.setScale(1 * this.scale);
  }
  setScale(s) {
    this.scale = s;
    super.updateAttributes();
    this.setSubComponentAttributes();
  }
}
class InputSocketComponent extends Component {
  static Type = {
    BOOLEAN: "bool"
  }
  constructor(x, y, width, height, scale, type) {
    super(x, y, width, height, scale);

    this.type = type;

    this.cCircle = new Circle(0, 0, 8 * this.scale, true);
    this.cCircle.setColor("white");
    this.elements.push({ element: this.cCircle, render: (el) => el.createSVGElement() });

    this.cT = new RoundedTriangleComponent(22 * this.scale, -1 * this.scale, 90, 1 * this.scale);
    this.cT.setColor("white");
    this.elements.push({ element: this.cT, render: (el) => el.createSVGElement() });

    return this;
  }
  setSubComponentAttributes() { // update sub-elements
    this.cT.setPosition({
      x: 22 * this.scale,
      y: -1 * this.scale
    });
    this.cCircle.radius = 8 * this.scale;
    this.cT.setScale(1 * this.scale);
  }
  setScale(s) {
    this.scale = s;
    super.updateAttributes();
    this.setSubComponentAttributes();
  }
}
class Node extends Component {
  constructor(x, y, width, height, scale) {
    super(x, y, width, height, scale);

    this.colors = {
      background: "#1d1d1d",
      header: "#8a5794"
    }

    this.shadows = SVGEngine.createShadowFilter(1, 1); // create the shadow defs element
    this.shadowElement = this.shadows.element;
    this.elements.push({ element: this.shadows.element, render: (el) => el });

    this.bgRect = new Rectangle(0, 1, this.tw, this.th, true, 4);
    this.bgRect.setColor(this.colors.background);
    this.bgRect.setStroke({
      color: "black",
      width: 0.5
    });
    this.bgRect.setShadow(this.shadows.id);
    this.elements.push({ element: this.bgRect, render: (el) => el.createSVGElement() });

    this.hRect = new Rectangle(0, 0, this.tw, this.th * 0.20, true, 5);
    this.hRect.setColor(this.colors.header);
    this.hRect.setStroke({
      color: this.colors.background,
      width: 0.5
    });
    this.clip = this.hRect.createClipPath(0);
    this.hRect.setClipPath(this.clip.id);
    this.elements.push({ element: this.clip, render: (el) => el.element });
    this.elements.push({ element: this.hRect, render: (el) => el.createSVGElement() });

    this.sockets = [];
    this.plugs = [];
    this.elements.push({ element: this.sockets, render: (el) => { return el.map(e => e.createSVGElement()); } });
    this.elements.push({ element: this.plugs, render: (el) => { return el.map(e => e.createSVGElement()); } });

    return this;
  }
  update() {
    /*this.elements.forEach((e, i) => {

    });*/
  }
  setSubComponentAttributes() {
    this.bgRect.setScale(this.scale);
    this.hRect.setScale(this.scale);

    this.sockets.forEach((socket, i) => {
      socket.setPosition({
        x: -8 * this.scale,
        y: (this.th * 0.2) + 25 * this.scale + (36 * i) * this.scale
      });
      socket.setScale(this.scale);
    });
    this.plugs.forEach((plug, i) => {
      plug.setPosition({
        x: this.tw - (36 - 8) * this.scale,
        y: (this.th * 0.2) + 25 * this.scale + (36 * i) * this.scale
      })
      plug.setScale(this.scale);
    });
  }
  setScale(s) {
    this.scale = s;
    super.updateAttributes();
    this.setSubComponentAttributes();
  }
  addAttachment(at) { // attachments like the move listener
    this.attachments.push(at);
    at.attach(this);
  }
  setName(name) {
    this.name = name;
    this.nText = new Text(5, 20, name);
    this.nText.setColor("white");
    console.log(this.nText);
    this.elements.push({ element: this.nText, render: (el) => el.createSVGElement() });
  }
  setClass(c) {
    this.class = c;
    //this.cText = new Text();
  }
  addSocket(type) {
    const socket = new InputSocketComponent((-8 * this.scale), (this.th * 0.2) + 25 * this.scale + (36 * this.sockets.length) * this.scale, 16, 34, this.scale, type);
    this.sockets.push(socket);
    return this.sockets;
  }
  addPlug(type) {
    const plug = new OutputPlugComponent(this.tw - (36 - 8) * this.scale, (this.th * 0.2) + 25 * this.scale + (36 * this.plugs.length) * this.scale, 16, 34, this.scale, type);
    this.plugs.push(plug);
    return this.plug;
  }
}
class ConditionNode extends Node {
  constructor(x, y, width, height, scale) {
    super(x, y, width, height, scale);

    this.setName("If");

    this.addSocket(InputSocketComponent.Type.BOOLEAN);
    this.addPlug(OutputPlugComponent.Type.CONNECTOR);

    const dragHandler = new NodeDragAttachment();
    dragHandler.attach(this);

    return this;
  }
}
class Attachment {
  constructor() {
    this.node = null;

    return this;
  }
  attach(node) {
    this.node = node;
  }
}
class NodeDragAttachment extends Attachment {
  constructor() {
    super();

    this.dragging = false;
    this.mouseStartPos = {}; // the mouse position when you start dragging to calc the offset
    this.mouseElemOffset = {}; // offset of the mouse position to the element

    return this;
  }
  attach(node) {
    super.attach(node);
    node.hRect.addEventListener("mousedown", (e) => {
      this.mouseStartPos = {
        x: e.clientX,
        y: e.clientY
      };
      this.nodeStartPos = {
        x: this.node.x,
        y: this.node.y
      }
      this.dragging = true;
    });
    node.hRect.addEventListener("mouseup", () => {
      this.mouseStartPos = {};
      this.dragging = false;
    });
    window.addEventListener("mousemove", (e) => { // window, to prevent glitches
      if (!this.dragging) return;
      let xDiff = e.clientX - this.mouseStartPos.x;
      let yDiff = e.clientY - this.mouseStartPos.y;
      let x = this.nodeStartPos.x + xDiff;
      let y = this.nodeStartPos.y + yDiff;
      this.node.setPosition({ x: x, y: y });
    });
  }
}
class Text {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.txt = text;
    this.isComponent = true;
  }
  static measureText() {

  }
  setColor(color) {
    this.color = color;
  }
  createSVGElement() {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.innerHTML = this.txt;
    text.setAttribute("x", this.x);
    text.setAttribute("y", this.y);
    if (this.color) text.setAttribute("fill", this.color);
    return text;
  }
  /*setScale(scale) { // TODO:

  }*/
}
class Triangle {
  constructor(x, y, width, height, rot, rounded) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rot = rot;
    this.rounded = rounded;
    this.isComponent = true;

    return this;
  }
  setColor(color) {
    this.color = color;
  }
  setStroke(opts) {
    this.stroke = opts.stroke;
    this.strokeWidth = opts.width;
  }
  createSVGElement() {
    const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    let x = this.x;
    let y = this.y;
    triangle.setAttribute("points", x + "," + (y + this.height) + " " + (x + this.width) + "," + (y + this.height) + " " + (x + (this.width / 2)) + "," + y);
    if (this.color) triangle.setAttribute("fill", this.color);
    if (this.stroke) triangle.setAttribute("stroke", this.stroke);
    if (this.strokeWidth) triangle.setAttribute("stroke-width", this.strokeWidth);
    if (this.rot) triangle.setAttribute("transform", "rotate(" + this.rot + "," + (x + this.width / 2) + "," + (y + this.height / 2) + ")");
    if (this.rounded) triangle.setAttribute("stroke-linejoin", "round");
    return triangle;
  }
  setScale() {
    console.error("TODO!");
  }
}
class Circle {
  constructor(x, y, radius, cornerCoords) {
    this.x = (cornerCoords) ? x + radius : x;
    this.y = (cornerCoords) ? y + radius : y;
    this.ox = x; // original x and y
    this.oy = y;
    this.r = radius;
    this.cornerCoords = cornerCoords;
    this.isComponent = true;

    this.container = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.updateAttributes();

    return this;
  }
  set radius(r) {
    this.r = r;
    if (!this.cornerCoords) return this.updateAttributes();
    this.x = this.ox + r;
    this.y = this.oy + r;
    return this.updateAttributes();
  }
  get radius() {
    return this.r;
  }
  setPosition(pos) {
    this.x = (this.cornerCoords) ? pos.x + this.r : pos.x;
    this.y = (this.cornerCoords) ? pos.y + this.r : pos.y;
    this.updateAttributes();
  }
  setColor(color) {
    this.color = color;
    this.updateAttributes();
  }
  setStroke(opts) {
    this.stroke = opts.stroke;
    this.strokeWidth = opts.width;
    this.updateAttributes();
  }
  update(parent) {
    this.scale = parent.scale;
    this.updateAttributes();
  }
  updateAttributes() {
    const circle = this.container;
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", this.y);
    circle.setAttribute("r", this.r);
    if (this.stroke) circle.setAttribute("stroke", this.stroke);
    if (this.strokeWidth) circle.setAttribute("stroke-width", this.strokeWidth);
    if (this.color) circle.setAttribute("fill", this.color);
  }
  createSVGElement() {
    return this.container;
  }
}
class Rectangle {
  constructor(x, y, width, height, rounded = false, radius = 0) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.rounded = rounded;
    this.isComponent = true;

    this.radius = radius;
    this.rx = (radius !== 0) ? radius : 0.3;
    this.ry = (radius !== 0) ? radius : 0.3;

    this.shadow = null;

    this.eventElem = document.createElement("span");
    this.clickEvent = new Event("click");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    this.elem = rect;

    return this;
  }
  setColor(color) {
    this.color = color;
  }
  setStroke(opts) {
    this.stroke = opts.color;
    this.strokeWidth = opts.width;
  }
  setShadow(shadow) {
    this.shadow = shadow;
  }
  setClipPath(path) {
    this.clipPath = path;
  }
  addEventListener(event, cb) {
    //return this.eventElem.addEventListener(event, cb);
    return this.elem.addEventListener(event, cb);
  }
  createClipPath(yOffset) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    let id = "rounded" + (new Date()).getTime();
    path.id = id;
    defs.appendChild(path);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", 0);
    rect.setAttribute("y", yOffset);
    rect.setAttribute("width", this.width);
    rect.setAttribute("height", this.height + this.radius);
    rect.setAttribute("rx", this.radius);
    rect.setAttribute("ry", this.radius);
    path.appendChild(rect);

    return { element: defs, id: id };
  }
  updateAttributes() {
    const rect = this.elem;
    rect.setAttribute("x", this.x);
    rect.setAttribute("y", this.y);
    rect.setAttribute("width", this.width);
    rect.setAttribute("height", this.height);
    if (this.color) rect.setAttribute("fill", this.color);
    if (this.stroke) rect.setAttribute("stroke", this.stroke);
    if (this.strokeWidth) rect.setAttribute("stroke-width", this.strokeWidth);
    if (this.shadow) rect.setAttribute("filter", "url(#" + this.shadow + ")");
    if (!this.rounded) return rect;
    if (this.clipPath) {
      rect.setAttribute("clip-path", "url(#" + this.clipPath + ")");
      return rect;
    }
    rect.setAttribute("rx", this.rx);
    rect.setAttribute("ry", this.ry);
  }
  createSVGElement() {
    this.updateAttributes();
    /*rect.onclick = () => {
      this.eventElem.dispatchEvent(this.clickEvent);
    }*/
    return this.elem;
  }
  updateClip() {
    const e = document.querySelector("#" + this.clipPath); // get the clipPath element
    e.setAttribute("width", this.width);
    e.setAttribute("height", this.height + this.rx);

    const rect = e.children[0];
    rect.setAttribute("rx", this.rx);
    rect.setAttribute("ry", this.ry);
    rect.setAttribute("width", this.width);
    rect.setAttribute("height", this.height + this.rx);
  }
  setScale(scale) {
    this.scale = scale;
    this.height = this.height * scale;
    this.width = this.width * scale;
    this.radius = this.radius * scale;
    this.rx = (this.radius !== 0) ? this.radius : 0.3;
    this.ry = (this.radius !== 0) ? this.radius : 0.3;
    if (this.clipPath) {
      this.updateClip();
    }
    this.updateAttributes();
  }
}
class RasterBackground {
  constructor(x, y, width, height, zoom) {
    this.colors = {
      background: "#141414",
      dot: "#1c1c1c"
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.zoom = zoom;

    this.container = document.createElementNS("http://www.w3.org/2000/svg", "g");

    this.bg = new Rectangle(0, 0, this.width, this.height);
    this.bg.setColor(this.colors.background);

    this.baseDist = this.width / 23;
    this.dotRad = 5;

    // panning support
    this.bgPos = { // pan position
      x: 0,
      y: 0
    };
    this.mouseStartPos = {
      x: 0,
      y: 0
    };
    this.dragging = false;

    return this;
  }
  attach(engine) { // called on attaching to an SVGEngine
    this.engine = engine;
  }
  pan(xDiff, yDiff, cXDiff, cYDiff) { // cDiff == the changes since the last event
    let dotDiffX = xDiff % this.distance; // the difference a single dot has to move
    let dotDiffY = yDiff % this.distance;

    this.dots.forEach((dot) => {
      dot.setPosition({ x: dot.x + cXDiff, y: dot.y + cYDiff });

      // if it moved too far, move it back to the other side
      // round x and y to the dot distance this.baseDist
      let dotXRound = Math.round(dot.x / this.baseDist) * this.baseDist;
      if (dot.x > this.width) {
        dot.setPosition({ x: dot.x - this.width, y: dot.y });
      }
      if (dot.x < 0) {
        dot.setPosition({ x: dot.x + this.width, y: dot.y });
      }

      if (dot.y > this.height) {
        dot.setPosition({ x: dot.x, y: dot.y - this.height });
      }

      if (dot.y < 0) {
        dot.setPosition({ x: dot.x, y: dot.y + this.height });
      }
    });

    if (!this.engine) return;
    this.engine.components.forEach(d => {
      let component = d.component;
      component.setPosition({ x: component.x + cXDiff, y: component.y + cYDiff });
    });
  }
  initPanning() {
    window.addEventListener("auxclick", (event) => {
      if (event.button === 1) event.preventDefault();
    });

    this.container.addEventListener("mousedown", (e) => {
      this.dragging = true;
      this.mouseStartPos = {
        x: e.clientX,
        y: e.clientY
      };
    });
    window.addEventListener("mousemove", (e) => { // prevent glitching with window.on...
      if (!this.dragging) return;
      let xDiff = e.clientX - this.mouseStartPos.x;
      let yDiff = e.clientY - this.mouseStartPos.y;
      this.bgPos.x += xDiff;
      this.bgPos.y += yDiff;
      this.pan(xDiff, yDiff, e.movementX, e.movementY);
    });
    this.container.addEventListener("mouseup", () => {
      this.dragging = false;
      this.mouseStartPos = { x: 0, y: 0 };
    });
  }
  createDots() {
    this.distance = this.baseDist * this.zoom;
    this.rad = this.dotRad * this.zoom;

    this.dots = [];
    this.columns = Math.floor(this.width / this.distance);
    this.rows = Math.floor(this.height / this.distance);

    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        const circle = new Circle(this.distance * (i + 1), this.distance * (j + 1), this.rad, false);
        circle.setColor(this.colors.dot);
        this.dots.push(circle);
      }
    }
  }
  createSVGElement() {
    this.container.innerHTML = "";
    this.createDots();
    this.initPanning();
    this.container.append(this.bg.createSVGElement());
    this.container.append(...this.dots.map(el => el.createSVGElement()));
    return this.container;
  }
  setScale() {

  }
}

class SVGEngine {
  constructor() {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.element.setAttribute("height", window.innerHeight);
    this.element.setAttribute("width", window.innerWidth);
    document.body.appendChild(this.element);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.components = [];
    this.scale = 1;

    return this;
  }
  static createShadowFilter(dx = 3, dy = 3, x = 0, y = 0, deviation = 2) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    let id = "shadow" + (new Date()).getTime();
    filter.id = id;
    filter.setAttribute("x", x);
    filter.setAttribute("y", y);
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    defs.appendChild(filter);

    const offset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
    offset.setAttribute("dx", dx);
    offset.setAttribute("dy", dy);
    offset.setAttribute("in", "SourceAlpha");
    offset.setAttribute("result", "offset");
    filter.appendChild(offset);

    const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    blur.setAttribute("in", "offset");
    blur.setAttribute("stdDeviation", deviation);
    blur.setAttribute("result", "blur");
    filter.appendChild(blur);

    const blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
    blend.setAttribute("in", "SourceGraphic");
    blend.setAttribute("in2", "blur");
    blend.setAttribute("mode", "normal");
    filter.appendChild(blend);

    return { element: defs, id: id };
  }
  setBackground(bgrd) {
    bgrd.attach(this);
    this.element.appendChild(bgrd.createSVGElement());
  }
  zoomOut() {
    this.components.forEach((c) => {
      c.component.setScale(0.5);
    });
  }
  zoomIn() {
    this.components.forEach((c) => {
      c.component.setScale(1.5);
    });
  }
  addComponent(c, render = (el) => el.createSVGElement()) {
    this.components.push({ component: c, render: render });
    this.element.appendChild(render(c));
  }
  createPath() {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M10 10 L100 100");
    path.setAttribute("stroke", "black");
    this.element.appendChild(path);
  }
}
class RoundedTriangle {
  constructor(x, y, cd, width) {
    this.ox = x;
    this.oy = y;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = (width / 2) * Math.sqrt(3);
    this.cd = cd; // corner distance, distance from the corner of the triangle where the curve starts
    this.cornerHeight = (cd / 2) * Math.sqrt(3);
    this.strokeWidth = 3;

    this.container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.container.appendChild(this.path);
    this.stroke = "white";
    this.path.setAttribute("stroke", this.stroke);
    this.path.setAttribute("stroke-width", this.strokeWidth);
    this.path.setAttribute("fill", "white");

    y += cd + this.cornerHeight; // some correctins
    x += cd;

    let cT = this.createCorner(x + width / 2, y - cd, -1, -1); // create top corner:
    // create line from top to bottom right corner:
    // the moveto is just for correction
    let rl = "m " + cd + " 0 l " + (width / 2 - (cd / 2)) + " " + (this.height - cd);
    let cBr = " " + this.createCorner(cd / 2, this.cornerHeight, 1, 1, true); // bottom right corner:
    let bl = "m " + (-cd / 2) + " " + this.cornerHeight + " l " + (-(width - cd)) + " 0"; // line to last corner:
    let cBl = " " + this.createCorner(-cd, 0, -1, 1, true); // last corner
    let ll = "m 0 0 l " + (width / 2 - (cd / 2.3)) + " " + (-(this.height - (this.cornerHeight))) + " Z"; // last line with close command

    this.createFilling([ // I have no idea what I did here ._.
      {
        x: x + width / 2 - cd / 2,
        y: y - cd - 2
      },
      {
        x: x + width / 2 + cd / 2,
        y: y - cd - 2
      },
      {
        x: x + width,
        y: y + this.height - this.cornerHeight - cd * 2
      },
      {
        x: x + width - cd / 2,
        y: y + this.height - cd * 2 - this.strokeWidth / 2
      },
      {
        x: x + cd / 2,
        y: y + this.height - cd * 2 - this.strokeWidth / 2
      },
      {
        x: x,
        y: y + this.height - this.cornerHeight - cd * 2
      }
    ]); // work around for the path not filling correctly :/... idk I'm a newbie at pths
    this.container.appendChild(this.filling);
    this.filling.setAttribute("fill", "white");

    this.d = cT + rl + cBr + bl + cBl + ll;
    this.path.setAttribute("d", this.d);
  }
  createFilling(corners) {
    this.filling = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    let p = "";
    corners.forEach((c) => {
      p += c.x + "," + c.y + " ";
    });
    this.filling.setAttribute("points", p);
    return this.filling;
  }
  createCorner(x, y, rot, yDir, relativeCoords = false) {
    let cd = this.cd;
    cd = cd * rot; // rot == -1 || 1; -1 == "left"; 1 == "right"
    let cmd = (relativeCoords) ? "m" : "M";
    let d = "";
    if (yDir == 1) { // horizontal
      d = cmd + " " + (x - cd) + " " + y + " ";
      let height = (cd / 2) * Math.sqrt(3) * rot;
      d += "s " + cd + " 0, " + (cd / 2) + " " + (-height) + " ";
    } else { // vertical
      d = cmd + " " + (x - (cd / 2)) + " " + (y + cd) + " ";
      d += "s " + (cd / 2) + " " + cd + ", " + cd + " 0";
    }
    return d;
  }
}
class RoundedTriangleComponent extends RoundedTriangle {
  constructor(x, y, rot, scale) {
    super(1, 1, 3, 13);
    this.x = x - 1;
    this.y = y - 1;
    this.rot = rot;
    this.scale = scale;
    this.isComponent = true;

    this.rx = 1; // relative coords of the path/polygon
    this.ry = 1;

    const parentContainer = this.container;
    this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.container.style.overflow = "overlay";
    this.container.appendChild(parentContainer);
    this.updateAttributes();

    return this;
  }
  setScale(s) {
    this.scale = s;
    this.updateAttributes();
  }
  setPosition(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.updateAttributes();
  }
  setColor(color) {
    this.color = color;
    this.updateAttributes();
  }
  setStroke(opts) {
    this.stroke = opts.stroke;
    this.strokeWidth = opts.width;
    this.updateAttributes();
  }
  updateAttributes() {
    const path = this.path;
    const filling = this.filling;
    const svg = this.container;

    svg.setAttribute("x", this.x);
    svg.setAttribute("y", this.y);

    if (this.color) {
      path.setAttribute("fill", this.color);
      filling.setAttribute("fill", this.color);
    }
    if (this.stroke) {
      path.setAttribute("stroke", this.stroke);
      filling.setAttribute("stroke", this.stroke);
    }
    if (this.strokeWidth) {
      path.setAttribute("stroke-width", this.strokeWidth);
      filling.setAttribute("stroke-width", this.strokeWidth);
    }
    if (this.rot || this.scale) {
      path.setAttribute("transform", ((this.scale) ? "scale(" + this.scale + ") " : " ") + ((this.rot) ? "rotate(" + this.rot + "," + (this.rx + this.width / 2) + "," + (this.ry + this.height / 2) + ")" : ""));
      filling.setAttribute("transform", ((this.scale) ? "scale(" + this.scale + ") " : " ") + ((this.rot) ? "rotate(" + this.rot + "," + (this.rx + this.width / 2) + "," + (this.ry + this.height / 2) + ")" : ""));
    }
  }
  createSVGElement() {
    return this.container;
  }
  setScale(scale) {
    this.scale = scale;
    this.updateAttributes();
  }
}

document.body.style.height = window.innerHeight + "px";
document.body.style.width = window.innerWidth + "px";

const engine = new SVGEngine();
const bgrd = new RasterBackground(0, 0, engine.width, engine.height, 1);
engine.setBackground(bgrd);

const rect = new Rectangle(120, 120, 50, 50, true);
rect.setColor("black");
rect.setStroke({
  color: "black",
  width: 1
});

const condition = new ConditionNode(100, 100, 200, 150, 1);
engine.addComponent(condition);

const condition1 = new ConditionNode(250, 250, 200, 150, 1);
engine.addComponent(condition1);

const r = new Rectangle(150, 150, 50, 50, true);

document.body.style.overflow = "hidden";

window.addEventListener("mousewheel", (e) => {
  if (!e.ctrlKey) return;
  if (e.deltaY > 0) {
    // zoom out
    engine.zoomOut();
  } else {
    // zoom in
    engine.zoomIn();
  }
});
