/**
    * Verte v0.0.12
    * (c) 2019 Baianat
    * @license MIT
    */
/**
  * color-fns v0.0.10
  * (c) 2019 Baianat
  * @license MIT
  */
function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) { descriptor.writable = true; }
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) { _defineProperties(Constructor.prototype, protoProps); }
  if (staticProps) { _defineProperties(Constructor, staticProps); }
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) { _setPrototypeOf(subClass, superClass); }
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) { break; }
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) { return; }
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function getColorModel(color) {
  if (_typeof(color) === 'object' && color.model) {
    return color.model;
  }

  if (color.slice(0, 1) === '#' && (color.length === 4 || color.length === 7)) {
    return 'hex';
  }

  if (color.slice(0, 1) === '#' && (color.length === 6 || color.length === 9)) {
    return 'hex';
  }

  if (color.slice(0, 4).toUpperCase() === 'RGBA') {
    return 'rgb';
  }

  if (color.slice(0, 3).toUpperCase() === 'RGB') {
    return 'rgb';
  }

  if (color.slice(0, 4).toUpperCase() === 'HSLA') {
    return 'hsl';
  }

  if (color.slice(0, 3).toUpperCase() === 'HSL') {
    return 'hsl';
  }

  return false;
}

function hexNumToDec(hexNum) {
  if (isNaN(parseInt(hexNum, 16))) {
    return 0;
  }

  return parseInt(hexNum, 16);
}

function isBetween(lb, ub) {
  return function (value) {
    return value >= lb && value <= ub;
  };
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function mixValue(val1, val2) {
  var ratio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
  return Number((val1 * (1 - ratio) + val2 * ratio).toFixed(2));
}
function isValidAlpha(alpha) {
  return !(alpha === undefined || isNaN(alpha) || alpha < 0 || alpha > 1);
}

var Color =
/*#__PURE__*/
function () {
  function Color(components) {
    var _this = this;

    _classCallCheck(this, Color);

    this.invalid = !this.validate(components);

    if (!this.invalid) {
      Object.keys(components).forEach(function (c) {
        _this[c] = components[c];
      });
    }

    this.init();
  }

  _createClass(Color, [{
    key: "init",
    value: function init() {}
  }, {
    key: "validate",
    value: function validate(components) {
      return !!components && _typeof(components) === 'object';
    }
  }]);

  return Color;
}();
var RgbColor =
/*#__PURE__*/
function (_Color) {
  _inherits(RgbColor, _Color);

  function RgbColor() {
    _classCallCheck(this, RgbColor);

    return _possibleConstructorReturn(this, _getPrototypeOf(RgbColor).apply(this, arguments));
  }

  _createClass(RgbColor, [{
    key: "validate",
    value: function validate(components) {
      if (!_get(_getPrototypeOf(RgbColor.prototype), "validate", this).call(this, components)) {
        return false;
      }

      var isInRange = isBetween(0, 255);
      return isInRange(components.red) && isInRange(components.green) && isInRange(components.blue);
    }
  }, {
    key: "init",
    value: function init() {
      this.model = 'rgb';
      this.alpha = isValidAlpha(this.alpha) ? this.alpha : 1;
    }
  }, {
    key: "toString",
    value: function toString() {
      if (this.invalid) {
        return 'Invalid Color';
      }

      if (isBetween(0, 0.999)(this.alpha)) {
        return "rgba(".concat(this.red, ",").concat(this.green, ",").concat(this.blue, ",").concat(this.alpha, ")");
      }

      return "rgb(".concat(this.red, ",").concat(this.green, ",").concat(this.blue, ")");
    }
  }]);

  return RgbColor;
}(Color);
var HslColor =
/*#__PURE__*/
function (_Color2) {
  _inherits(HslColor, _Color2);

  function HslColor() {
    _classCallCheck(this, HslColor);

    return _possibleConstructorReturn(this, _getPrototypeOf(HslColor).apply(this, arguments));
  }

  _createClass(HslColor, [{
    key: "validate",
    value: function validate(components) {
      if (!_get(_getPrototypeOf(HslColor.prototype), "validate", this).call(this, components)) {
        return false;
      }

      var isPercentage = isBetween(0, 100);
      return isBetween(0, 360)(components.hue) && isPercentage(components.lum) && isPercentage(components.sat);
    }
  }, {
    key: "init",
    value: function init() {
      this.model = 'hsl';
      this.alpha = isValidAlpha(this.alpha) ? this.alpha : 1;
    }
  }, {
    key: "toString",
    value: function toString() {
      if (this.invalid) {
        return 'Invalid Color';
      }

      if (isBetween(0, 0.999)(this.alpha)) {
        return "hsla(".concat(this.hue, ",").concat(this.sat, "%,").concat(this.lum, "%,").concat(this.alpha, ")");
      }

      return "hsl(".concat(this.hue, ",").concat(this.sat, "%,").concat(this.lum, "%)");
    }
  }]);

  return HslColor;
}(Color);
var HexColor =
/*#__PURE__*/
function (_Color3) {
  _inherits(HexColor, _Color3);

  function HexColor() {
    _classCallCheck(this, HexColor);

    return _possibleConstructorReturn(this, _getPrototypeOf(HexColor).apply(this, arguments));
  }

  _createClass(HexColor, [{
    key: "validate",
    value: function validate(components) {
      if (!_get(_getPrototypeOf(HexColor.prototype), "validate", this).call(this, components)) {
        return false;
      }

      return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test("#".concat(components.red).concat(components.green).concat(components.blue));
    }
  }, {
    key: "init",
    value: function init() {
      this.model = 'hex';
      this.alpha = this.alpha !== undefined ? this.alpha : 'ff';
    }
  }, {
    key: "toString",
    value: function toString() {
      if (this.invalid) {
        return 'Invalid Color';
      }

      if (isBetween(0, 0.999)(hexNumToDec(this.alpha) / 255)) {
        return "#".concat(this.red).concat(this.green).concat(this.blue).concat(this.alpha);
      }

      return "#".concat(this.red).concat(this.green).concat(this.blue);
    }
  }]);

  return HexColor;
}(Color);

var Colors = /*#__PURE__*/Object.freeze({
  Color: Color,
  RgbColor: RgbColor,
  HslColor: HslColor,
  HexColor: HexColor
});

function parseRgb(rgb) {
  if (_typeof(rgb) === 'object') {
    return rgb;
  } // will consider rgb/rgba color prefix as a valid input color
  // while the output will be a valid web colors
  // valid input colors examples 'rgb(100, 0, 0, 0.5)', 'rgba(0, 0, 0)'
  // the output for the inputted examples 'rgba(100, 0, 0, 0.5)', 'rgb(0, 0, 0)'


  var match = rgb.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,*\s*(\d*(?:\.\d+)*)*\)/i);

  if (!match || match.length < 4) {
    return new RgbColor();
  }

  return new RgbColor({
    red: Number(match[1]),
    green: Number(match[2]),
    blue: Number(match[3]),
    alpha: Number(match[4])
  });
}

function expandHexShorthand(hex) {
  var regex = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d])*$/i;

  if ((hex.length === 5 || hex.length === 4) && regex.test(hex)) {
    hex = hex.replace(regex, function (m, r, g, b, a) {
      return "#".concat(r).concat(r).concat(g).concat(g).concat(b).concat(b).concat(a ? "".concat(a).concat(a) : '');
    });
  }

  return hex;
}

function parseHex(hex) {
  if (_typeof(hex) === 'object') {
    return hex;
  }

  var expanded = expandHexShorthand(hex);
  var match = expanded.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})*/i);

  if (!match || match.length < 4) {
    return new HexColor();
  }

  return new HexColor({
    hex: expanded,
    red: match[1],
    green: match[2],
    blue: match[3],
    alpha: match[4]
  });
}

function parseHsl(hsl) {
  if (_typeof(hsl) === 'object') {
    return hsl;
  } // will consider hsl/hsla color prefix as a valid input color
  // while the output will be a valid web colors
  // valid input colors examples 'hsl(255, 100%, 50%, 0.5)', 'hsla(100, 100%, 50%)'
  // the output for the inputted examples 'hsla(255, 100%, 50%, 0.5)', 'hsl(100, 100%, 50%)'


  var match = hsl.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,*\s*(\d*(?:\.\d+)*)*\)/i);

  if (!match || match.length < 4) {
    return new HslColor();
  }

  return new HslColor({
    hue: Number(match[1]),
    sat: Number(match[2]),
    lum: Number(match[3]),
    alpha: Number(match[4])
  });
}

/**
 * Checks if the given color string is valid (parsable).
 *
 * @param {String} color The color string to be checked.
 */

function isValidColor(color) {
  var model = getColorModel(color);

  if (model === 'rgb') {
    return !parseRgb(color).invalid;
  }

  if (model === 'hex') {
    return !parseHex(color).invalid;
  }

  if (model === 'hsl') {
    return !parseHsl(color).invalid;
  }

  return false;
}

function decNumToHex(decNum) {
  decNum = Math.floor(decNum);

  if (isNaN(decNum)) {
    return '00';
  }

  return ('0' + decNum.toString(16)).slice(-2);
}

function rgbToHex(rgb) {
  if (!rgb) {
    return new HexColor();
  }

  rgb = parseRgb(rgb);
  var _ref = [decNumToHex(rgb.red), decNumToHex(rgb.green), decNumToHex(rgb.blue), rgb.alpha ? decNumToHex(rgb.alpha * 255) : null],
      rr = _ref[0],
      gg = _ref[1],
      bb = _ref[2],
      aa = _ref[3];
  return new HexColor({
    red: rr,
    green: gg,
    blue: bb,
    alpha: aa || 'ff'
  });
}

function rgb2Hsl(rgb) {
  if (!rgb) {
    return new HslColor();
  }

  rgb = parseRgb(rgb); // Convert the RGB values to the range 0-1

  var _ref = [rgb.red / 255, rgb.green / 255, rgb.blue / 255, rgb.alpha],
      red = _ref[0],
      green = _ref[1],
      blue = _ref[2],
      alpha = _ref[3];
  var hue = 0,
      sat = 0,
      lum = 0; // Find the minimum and maximum values of R, G and B.

  var min = Math.min(red, green, blue);
  var max = Math.max(red, green, blue); // Calculate the lightness value

  lum = (min + max) / 2; // Calculate the saturation.

  if (min !== max) {
    sat = lum > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  } // calculate the hue


  if (red >= max && min !== max) {
    hue = 60 * ((green - blue) / (max - min));
  }

  if (green >= max && min !== max) {
    hue = 60 * (2.0 + (blue - red) / (max - min));
  }

  if (blue >= max && min !== max) {
    hue = 60 * (4.0 + (red - green) / (max - min));
  } // normalize values


  hue = hue < 0 ? Math.floor(hue + 360) : Math.floor(hue);
  sat = Math.floor(sat * 100);
  lum = Math.floor(lum * 100);
  return new HslColor({
    hue: hue,
    sat: sat,
    lum: lum,
    alpha: alpha
  });
}

function hexToRgb(hex) {
  if (!hex) {
    return new RgbColor();
  }

  var _parseHex = parseHex(hex),
      red = _parseHex.red,
      green = _parseHex.green,
      blue = _parseHex.blue,
      alpha = _parseHex.alpha;

  return new RgbColor({
    red: hexNumToDec(red),
    green: hexNumToDec(green),
    blue: hexNumToDec(blue),
    alpha: alpha === undefined ? 1 : Number((hexNumToDec(alpha) / 255).toFixed(2))
  });
}

function normalizeDecNum(value) {
  return Math.min(Math.max(parseInt(value), 0), 255);
}

function hslToRgb(hsl) {
  if (!hsl) {
    return new RgbColor();
  }
  hsl = parseHsl(hsl);
  var _ref = [hsl.hue / 360, hsl.sat / 100, hsl.lum / 100, hsl.alpha],
      hue = _ref[0],
      sat = _ref[1],
      lgh = _ref[2],
      alpha = _ref[3];
  var red = 0,
      green = 0,
      blue = 0;

  if (sat === 0) {
    red = green = blue = normalizeDecNum(lgh * 255);
  }

  if (sat !== 0) {
    var temp1 = lgh >= 50 ? lgh + sat - lgh * sat : lgh * (1 + sat);
    var temp2 = 2 * lgh - temp1;

    var testHue = function testHue(test) {
      if (test < 0) { test += 1; }
      if (test > 1) { test -= 1; }
      if (test < 1 / 6) { return temp2 + (temp1 - temp2) * 6 * test; }
      if (test < 1 / 2) { return temp1; }
      if (test < 2 / 3) { return temp2 + (temp1 - temp2) * (2 / 3 - test) * 6; }
      return temp2;
    };

    red = normalizeDecNum(255 * testHue(hue + 1 / 3));
    green = normalizeDecNum(255 * testHue(hue));
    blue = normalizeDecNum(255 * testHue(hue - 1 / 3));
  }

  return new RgbColor({
    red: red,
    green: green,
    blue: blue,
    alpha: alpha
  });
}

function hexToHsl(hex) {
  if (!hex) {
    return new HslColor();
  }

  return rgb2Hsl(hexToRgb(hex));
}

function hslToHex(hsl) {
  if (!hsl) {
    return new HexColor();
  }

  return rgbToHex(hslToRgb(hsl));
}

/**
 * Parses the given color string into a RGB color object.
 *
 * @param {String} color The color to be parsed and converted.
 */

function toRgb(color) {
  var model = getColorModel(color);

  if (model === 'hex') {
    return hexToRgb(color);
  }

  if (model === 'hsl') {
    return hslToRgb(color);
  }

  if (model === 'rgb' && typeof color === 'string') {
    return parseRgb(color);
  }

  if (model === 'rgb' && _typeof(color) === 'object') {
    return color;
  }

  return new RgbColor();
}

/**
 * Parses the given color string into a HSL color object.
 *
 * @param {String} color The color to be parsed and converted.
 */

function toHsl(color) {
  var model = getColorModel(color);

  if (model === 'hex') {
    return hexToHsl(color);
  }

  if (model === 'rgb') {
    return rgb2Hsl(color);
  }

  if (model === 'hsl' && typeof color === 'string') {
    return parseHsl(color);
  }

  if (model === 'hsl' && _typeof(color) === 'object') {
    return color;
  }

  return new HslColor();
}

/**
 * Parses the given color string into a Hex color object.
 *
 * @param {String} color The color to be parsed and converted.
 */

function toHex(color) {
  var model = getColorModel(color);

  if (model === 'rgb') {
    return rgbToHex(color);
  }

  if (model === 'hsl') {
    return hslToHex(color);
  }

  if (model === 'hex' && typeof color === 'string') {
    return parseHex(color);
  }

  if (model === 'hex' && _typeof(color) === 'object') {
    return color;
  }

  return new HexColor();
}

function getRandomColor() {
  return "rgb(".concat(getRandomInt(0, 255), ", ").concat(getRandomInt(0, 255), ", ").concat(getRandomInt(0, 255), ")");
}

function mixColors(color1, color2, ratio) {
  color1 = toRgb(color1);
  color2 = toRgb(color2);
  var red = Math.floor(mixValue(color1.red, color2.red, ratio));
  var green = Math.floor(mixValue(color1.green, color2.green, ratio));
  var blue = Math.floor(mixValue(color1.blue, color2.blue, ratio));
  var alpha = mixValue(color1.alpha, color2.alpha, ratio);
  return new RgbColor({
    red: red,
    green: green,
    blue: blue,
    alpha: alpha
  });
}

/**
 * Utilities
 */
function newArray (length, valueSource) {
  var array = [];
  for (var i = 0; i < length; i++) {
    var value = typeof valueSource === 'function' ? valueSource() : valueSource;
    array.push(value);
  }

  return array;
}

function debounce (func, immediate) {
  if ( immediate === void 0 ) immediate = false;

  var timeout;
  return function () {
    var arguments$1 = arguments;

    var later = function () {
      timeout = null;
      if (!immediate) { func.apply(void 0, arguments$1); }
    };
    var callNow = immediate && !timeout;
    window.cancelAnimationFrame(timeout);
    timeout = window.requestAnimationFrame(later);
    if (callNow) { func.apply(void 0, arguments); }
  };
}

function isElementClosest (element, wrapper) {
  while (element !== document && element !== null) {
    if (element === wrapper) { return true; }
    element = element.parentNode;
  }

  return false;
}

function getClosestValue (array, value) {
  return array.reduce(function (prev, curr) {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
}

function getPolarCoords (x, y) {
  return {
    r: Math.sqrt((x * x) + (y * y)),
    theta: Math.atan2(y, x) * 180 / Math.PI
  };
}

function getCartesianCoords (r, theta) {
  return {
    x: r * Math.cos(theta * Math.PI * 2),
    y: r * Math.sin(theta * Math.PI * 2)
  };
}

function warn (message) {
  console.warn(("[Verte]: " + message));
}

function makeListValidator (propName, list) {
  return function (value) {
    var isValid = list.indexOf(value) !== -1;
    if (!isValid && process.env.NODE_ENV !== 'production') {
      warn(("The \"" + propName + "\" property can be only one of: " + (list.map(function (l) { return "'" + l + "'"; }).join(', ')) + "."));
    }

    return isValid;
  };
}
function getEventCords (event) {
  if (event.type.match(/^touch/i)) {
    var touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  if (event.type.match(/^mouse/i)) {
    return { x: event.clientX, y: event.clientY };
  }
  return { x: 0, y: 0 };
}

//

var script = {
  name: 'VerteSlider',
  props: {
    gradient: Array,
    classes: Array,
    colorCode: { type: Boolean, default: false },
    editable: { type: Boolean, default: true },
    reverse: { type: Boolean, default: false },
    label: { type: Boolean, default: false },
    trackSlide: { type: Boolean, default: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 255 },
    step: { type: Number, default: 1 },
    value: { type: Number, default: 0 },
    handlesValue: { type: Array, default: function () { return [0]; } }
  },
  data: function () { return ({
    fill: {
      translate: 0,
      scale: 0
    },
    multiple: false,
    currentValue: 0,
    handles: [],
    values: []
  }); },
  watch: {
    gradient: function gradient (val) {
      this.initGradient(val);
      this.reloadHandlesColor();
    },
    values: function values () {
      this.multiple = this.values.length > 1;
      this.fill = this.multiple ? false : this.fill || {};
    },
    value: function value (val, oldVal) {
      if (val === oldVal || val === this.currentValue) { return; }

      this.updateValue(this.value, true);
    }
  },
  methods: {
    init: function init () {
      var this$1 = this;

      this.$emitInputEvent = debounce(function () {
        this$1.$emit('input', this$1.currentValue);
      });
      this.multiple = this.values.length > 1;
      this.values = this.handlesValue;
      this.handles = this.handlesValue.map(function (value, index) {
        return { value: value, position: 0, color: '#fff' };
      });
      if (this.values.length === 1) {
        this.values[0] = Number(this.value);
      }
      this.values.sort();

      this.initElements();
      if (this.gradient) {
        this.initGradient(this.gradient);
      }
      this.initEvents();
      this.values.forEach(function (handle, index) {
        this$1.activeHandle = index;
        this$1.updateValue(handle, true);
      });
    },
    initElements: function initElements () {
      var ref;

      this.wrapper = this.$refs.wrapper;
      this.track = this.$refs.track;
      this.fill = this.$refs.fill;

      this.wrapper.classList.toggle('slider--editable', this.editable);
      this.wrapper.classList.toggle('slider--reverse', this.reverse);
      if (this.classes) {
        (ref = this.wrapper.classList).add.apply(ref, this.classes);
      }
    },
    initGradient: function initGradient (gradient) {
      if (gradient.length > 1) {
        this.fill.style.backgroundImage = "linear-gradient(90deg, " + gradient + ")";
        return;
      }
      this.fill.style.backgroundImage = '';
      this.fill.style.backgroundColor = gradient[0];
      this.handles.forEach(function (handle) {
        handle.style.color = gradient[0];
      });
    },
    handleResize: function handleResize () {
      this.updateWidth();
      this.updateValue(this.currentValue, true);
    },
    initEvents: function initEvents () {
      window.addEventListener('resize', this.handleResize);
    },
    /**
     * fire select events
     */
    select: function select (event) {
      event.preventDefault();
      event.stopPropagation();
      // check if  left mouse is clicked
      if (event.buttons === 2) { return; }

      this.updateWidth();
      this.track.classList.add('slider--dragging');
      this.ticking = false;

      var stepValue = this.getStepValue(event);

      if (this.multiple) {
        var closest = getClosestValue(this.values, stepValue);
        this.activeHandle = this.values.indexOf(closest);
      }
      this.updateValue(stepValue);

      this.tempDrag = this.dragging.bind(this);
      this.tempRelease = this.release.bind(this);
      document.addEventListener('mousemove', this.tempDrag);
      document.addEventListener('touchmove', this.tempDrag);
      document.addEventListener('touchend', this.tempRelease);
      document.addEventListener('mouseup', this.tempRelease);
    },
    /**
     * dragging motion
     */
    dragging: function dragging (event) {
      var this$1 = this;

      var stepValue = this.getStepValue(event);
      if (!this.ticking) {
        window.requestAnimationFrame(function () {
          this$1.updateValue(stepValue);
          this$1.ticking = false;
        });

        this.ticking = true;
      }
    },
    /**
     * release handler
     */
    release: function release () {
      this.track.classList.remove('slider--dragging');
      document.removeEventListener('mousemove', this.tempDrag);
      document.removeEventListener('touchmove', this.tempDrag);
      document.removeEventListener('mouseup', this.tempRelease);
      document.removeEventListener('touchend', this.tempRelease);
    },
    getStepValue: function getStepValue (event) {
      var ref = getEventCords(event);
      var x = ref.x;

      var mouseValue = (x - this.currentX);
      var stepCount = parseInt((mouseValue / this.stepWidth) + 0.5, 10);
      var stepValue = (stepCount * this.step) + this.min;
      if (!this.decimalsCount) {
        return stepValue;
      }
      return Number(stepValue.toFixed(this.decimalsCount));
    },
    updateWidth: function updateWidth () {
      var trackRect = this.track.getBoundingClientRect();
      this.currentX = trackRect.left;
      this.width = trackRect.width;
      this.stepWidth = (this.width / (this.max - this.min)) * this.step;
    },
    /**
     * get the filled area percentage
     * @param  {Object} slider
     * @param  {Number} value
     * @return {Number}
     */
    getPositionPercentage: function getPositionPercentage (value) {
      return ((value - this.min) / (this.max - this.min)).toFixed(2);
    },
    normalizeValue: function normalizeValue (value) {
      if (isNaN(Number(value))) {
        return this.value;
      }
      if (this.multiple) {
        var prevValue = this.values[this.activeHandle - 1] || this.min;
        var nextValue = this.values[this.activeHandle + 1] || this.max;
        value = Math.min(Math.max(Number(value), prevValue), nextValue);
      }
      return Math.min(Math.max(Number(value), this.min), this.max);
    },
    addHandle: function addHandle (value) {
      var closest = getClosestValue(this.values, value);
      var closestIndex = this.values.indexOf(closest);
      var closestValue = this.values[closestIndex];
      var newIndex = closestValue <= value ? closestIndex + 1 : closestIndex;
      this.handles.splice(newIndex, 0, {
        value: value,
        position: 0,
        color: '#fff'
      });
      this.values.splice(newIndex, 0, value);

      this.activeHandle = newIndex;
      this.currentValue = null;
      this.updateValue(value);
    },
    removeHandle: function removeHandle (index) {
      this.handles.splice(index, 1);
      this.values.splice(index, 1);
      this.activeHandle = index === 0 ? index + 1 : index - 1;
    },
    /**
     * get the handle color
     * @param  {Number} positionPercentage
     * @return {Number} handle hex color code
     */
    getHandleColor: function getHandleColor (positionPercentage) {
      var this$1 = this;

      var colorCount = this.gradient.length - 1;
      var region = positionPercentage;
      for (var i = 1; i <= colorCount; i++) {
        // check the current zone
        if (region >= ((i - 1) / colorCount) && region <= (i / colorCount)) {
          // get the active color percentage
          var colorPercentage = (region - ((i - 1) / colorCount)) / (1 / colorCount);
          // return the mixed color based on the zone boundary colors
          return mixColors(this$1.gradient[i - 1], this$1.gradient[i], colorPercentage);
        }
      }
      return 'rgb(0, 0, 0)';
    },
    /**
     * update the slider fill, value and color
     * @param {Number} value
     */

    reloadHandlesColor: function reloadHandlesColor () {
      var this$1 = this;

      this.handles.forEach(function (handle, index) {
        var positionPercentage = this$1.getPositionPercentage(handle.value);
        var color = this$1.getHandleColor(positionPercentage);
        this$1.handles[index].color = color.toString();
      });
    },

    updateValue: function updateValue (value, muted) {
      var this$1 = this;
      if ( muted === void 0 ) muted = false;

      // if (Number(value) === this.value) return;

      window.requestAnimationFrame(function () {
        var normalized = this$1.normalizeValue(value);
        var positionPercentage = this$1.getPositionPercentage(normalized);

        if (this$1.fill) {
          this$1.fill.translate = positionPercentage * this$1.width;
          this$1.fill.scale = 1 - positionPercentage;
        }

        this$1.values[this$1.activeHandle] = normalized;
        this$1.handles[this$1.activeHandle].value = normalized;
        this$1.handles[this$1.activeHandle].position = positionPercentage * this$1.width;
        this$1.currentValue = normalized;
        this$1.$refs.input.value = this$1.currentValue;

        if (this$1.gradient) {
          var color = this$1.getHandleColor(positionPercentage);
          this$1.handles[this$1.activeHandle].color = color.toString();
          if (this$1.colorCode) {
            this$1.currentValue = color;
          }
        }

        if (muted) { return; }
        this$1.$emitInputEvent();
      });
    }
  },
  created: function created () {
    var stepSplited = this.step.toString().split('.')[1];
    this.currentValue = this.value;
    this.decimalsCount = stepSplited ? stepSplited.length : 0;
  },
  mounted: function mounted () {
    var this$1 = this;

    this.init();
    this.$nextTick(function () {
      this$1.updateWidth();
      this$1.updateValue(undefined, true);
    });
  },
  destroyed: function destroyed () {
    window.removeEventListener('resize', this.handleResize);
  },
};

/* script */
            var __vue_script__ = script;
/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { ref: "wrapper", staticClass: "slider" }, [
    _c(
      "div",
      _vm._g(
        { ref: "track", staticClass: "slider__track" },
        _vm.trackSlide ? { mousedown: _vm.select, touchstart: _vm.select } : {}
      ),
      [
        _c("div", { ref: "fill", staticClass: "slider__fill" }),
        _vm._l(_vm.handles, function(handle) {
          return _c(
            "div",
            {
              staticClass: "slider__handle",
              style:
                "transform: translate(" +
                handle.position +
                "px, 0); background-color: " +
                handle.color +
                ";",
              on: { mousedown: _vm.select, touchstart: _vm.select }
            },
            [
              _vm.label
                ? _c("div", { staticClass: "slider__label" }, [
                    _vm._v(_vm._s(handle.value))
                  ])
                : _vm._e()
            ]
          )
        })
      ],
      2
    ),
    _c("input", {
      directives: [
        {
          name: "show",
          rawName: "v-show",
          value: _vm.editable,
          expression: "editable"
        }
      ],
      ref: "input",
      staticClass: "slider__input",
      attrs: { type: _vm.colorCode ? "text" : "number" },
      on: {
        change: function($event) {
          _vm.updateValue($event.target.value);
        }
      }
    })
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    {
      component.__file = "/mnt/c/Users/Abdelrahman/Projects/verte/src/components/Slider.vue";
    }

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  function __vue_create_injector__() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
    var isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) { el.setAttribute('media', css.media); }
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
          else { style.element.appendChild(textNode); }
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var Slider = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    __vue_create_injector__,
    undefined
  );

//

var script$1 = {
  name: 'VertePicker',
  components: {
    Slider: Slider
  },
  props: {
    mode: { type: String, default: 'square' },
    edge: { type: Number, default: 250 },
    diameter: { type: Number, default: 180 },
    satSlider: { type: Boolean, default: true },
    alpha: { type: Number, default: 1 },
    value: { type: String, default: '#fff' }
  },
  data: function () { return ({
    currentHue: 0,
    currentSat: 0,
    currentColor: '',
    cursor: {},
    preventUpdating: false,
    preventEcho: false
  }); },
  watch: {
    // handles external changes.
    value: function value (val) {
      if (this.preventUpdating) {
        this.preventUpdating = false;
        return;
      }
      this.handleValue(val, true);
    },
    currentSat: function currentSat () {
      this.updateWheelColors();
      this.updateColor();
    },
    currentHue: function currentHue () {
      this.updateSquareColors();
      this.updateColor();
    }
  },
  methods: {
    initSquare: function initSquare () {
      // setup canvas
      var edge = this.edge;
      this.$refs.canvas.width = edge;
      this.$refs.canvas.height = edge - 100;
      this.ctx = this.$refs.canvas.getContext('2d');
      this.updateSquareColors();
    },
    initWheel: function initWheel () {
      // setup canvas
      this.$refs.canvas.width = this.diameter;
      this.$refs.canvas.height = this.diameter;
      this.ctx = this.$refs.canvas.getContext('2d');

      // draw wheel circle path
      this.circle = {
        path: new Path2D(), // eslint-disable-line
        xCords: this.diameter / 2,
        yCords: this.diameter / 2,
        radius: this.diameter / 2
      };
      this.circle.path.moveTo(this.circle.xCords, this.circle.yCords);
      this.circle.path.arc(
        this.circle.xCords,
        this.circle.yCords,
        this.circle.radius,
        0,
        360
      );
      this.circle.path.closePath();
      this.updateWheelColors();
    },
    // this function calls when the color changed from outside the picker
    handleValue: function handleValue (color, muted) {
      if ( muted === void 0 ) muted = false;

      var ref = this.pickerRect;
      var width = ref.width;
      var height = ref.height;
      this.currentColor = toHsl(color);
      // prvent upadtion picker slider for causing
      // echo udationg to the current color value
      this.preventEcho = true;

      if (this.mode === 'wheel') {
        var r = (100 - this.currentColor.lum) * (this.diameter / 200);
        var radius = this.diameter / 2;
        var coords = getCartesianCoords(r, this.currentColor.hue / 360);
        this.cursor = { x: coords.x + radius, y: coords.y + radius };
        this.currentSat = this.currentColor.sat;
      }

      if (this.mode === 'square') {
        var x = (this.currentColor.sat / 100) * width;
        var y = ((100 - this.currentColor.lum) / 100) * height;
        this.cursor = { x: x, y: y };
        this.currentHue = this.currentColor.hue;
      }
    },
    updateCursorPosition: function updateCursorPosition (ref) {
      var x = ref.x;
      var y = ref.y;

      var ref$1 = this.pickerRect;
      var left = ref$1.left;
      var top = ref$1.top;
      var width = ref$1.width;
      var height = ref$1.height;
      var normalized = {
        x: Math.min(Math.max(x - left, 0), width),
        y: Math.min(Math.max(y - top, 0), height)
      };

      if (
        this.mode === 'wheel'&&
        !this.ctx.isPointInPath(this.circle.path, normalized.x, normalized.y)
      ) {
        return;
      }

      this.cursor = normalized;
      this.updateColor();
    },
    // select color and update it to verte component
    // this function calls when the color changed from the picker
    updateColor: function updateColor (muted) {
      if ( muted === void 0 ) muted = false;

      if (this.preventEcho) {
        this.preventEcho = false;
        return;
      }

      this.currentColor = this.getCanvasColor();
      this.preventUpdating = true;
      this.$emit('change', this.currentColor);
      this.$emit('input', this.currentColor);
    },
    updateWheelColors: function updateWheelColors () {
      var this$1 = this;

      if (!this.circle) { return; }
      var ref = this.pickerRect;
      var width = ref.width;
      var height = ref.height;

      var x = this.circle.xCords;
      var y = this.circle.yCords;
      var radius = this.circle.radius;
      var sat = this.satSlider ? this.currentSat : 100;
      this.ctx.clearRect(0, 0, width, height);

      for (var angle = 0; angle < 360; angle += 1) {
        var gradient = this$1.ctx.createRadialGradient(x, y, 0, x, y, radius);
        var startAngle = (angle - 2) * Math.PI / 180;
        var endAngle = (angle + 2) * Math.PI / 180;

        this$1.ctx.beginPath();
        this$1.ctx.moveTo(x, y);
        this$1.ctx.arc(x, y, radius, startAngle, endAngle);
        this$1.ctx.closePath();

        gradient.addColorStop(0, ("hsl(" + angle + ", " + sat + "%, 100%)"));
        gradient.addColorStop(0.5, ("hsl(" + angle + ", " + sat + "%, 50%)"));
        gradient.addColorStop(1, ("hsl(" + angle + ", " + sat + "%, 0%)"));
        this$1.ctx.fillStyle = gradient;
        this$1.ctx.fill();
      }
    },
    updateSquareColors: function updateSquareColors () {
      var ref = this.pickerRect;
      var width = ref.width;
      var height = ref.height;
      this.ctx.clearRect(0, 0, width, height);

      this.ctx.fillStyle = "hsl(" + (this.currentHue) + ", 100%, 50%)";
      this.ctx.fillRect(0, 0, width, height);

      var grdBlack = this.ctx.createLinearGradient(0, 0, width, 0);
      grdBlack.addColorStop(0, "hsl(0, 0%, 50%)");
      grdBlack.addColorStop(1, "hsla(0, 0%, 50%, 0)");
      this.ctx.fillStyle = grdBlack;
      this.ctx.fillRect(0, 0, width, height);

      var grdWhite = this.ctx.createLinearGradient(0, 0, 0, height);
      grdWhite.addColorStop(0, "hsl(0, 0%, 100%)");
      grdWhite.addColorStop(0.5, "hsla(0, 0%, 100%, 0)");
      grdWhite.addColorStop(0.5, "hsla(0, 0%, 0%, 0)");
      grdWhite.addColorStop(1, "hsl(0, 0%, 0%) ");
      this.ctx.fillStyle = grdWhite;
      this.ctx.fillRect(0, 0, width, height);
    },
    getCanvasColor: function getCanvasColor () {
      var ref = this.cursor;
      var x = ref.x;
      var y = ref.y;
      var sat = 0;
      var lum = 0;
      var hue = 0;

      if (this.mode === 'wheel') {
        var radius = this.diameter / 2;
        var xShitft = x - radius;
        var yShitft = (y - radius) * -1;
        var ref$1 = getPolarCoords(xShitft, yShitft);
        var r = ref$1.r;
        var theta = ref$1.theta;
        lum = (radius - r) * 100 / radius;
        hue = !~Math.sign(theta) ? -theta : 360 - theta;
        sat = this.currentSat;
      }

      if (this.mode === 'square') {
        var ref$2 = this.pickerRect;
        var width = ref$2.width;
        var height = ref$2.height;
        sat = x * 100 / width;
        lum = 100 - (y * 100 / height);
        hue = this.currentHue;
      }
    
      return new Colors.HslColor({
        alpha: this.alpha,
        hue: Math.round(hue),
        sat: Math.round(sat),
        lum: Math.round(lum)
      });
    },
    handleSelect: function handleSelect (event) {
      var this$1 = this;

      event.preventDefault();
      this.pickerRect = this.$refs.canvas.getBoundingClientRect();
      this.updateCursorPosition(getEventCords(event));
      var tempFunc = function (evnt) {
        window.requestAnimationFrame(function () {
          this$1.updateCursorPosition(getEventCords(evnt));
        });
      };
      var handleRelase = function () {
        document.removeEventListener('mousemove', tempFunc);
        document.removeEventListener('touchmove', tempFunc);
        document.removeEventListener('mouseup', handleRelase);
        document.removeEventListener('touchend', handleRelase);
      };
      document.addEventListener('mousemove', tempFunc);
      document.addEventListener('touchmove', tempFunc);
      document.addEventListener('mouseup', handleRelase);
      document.addEventListener('touchend', handleRelase);
    }
  },
  mounted: function mounted () {
    var this$1 = this;

    this.pickerRect = this.$refs.canvas.getBoundingClientRect();
    if (this.mode === 'wheel') {
      this.initWheel();
    }
    if (this.mode === 'square') {
      this.initSquare();
    }
    this.$nextTick(function () {
      this$1.handleValue(this$1.value);
    });
  }
};

/* script */
            var __vue_script__$1 = script$1;
/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      ref: "picker",
      staticClass: "verte-picker",
      class: "verte-picker--" + _vm.mode
    },
    [
      _c("div", { ref: "origin", staticClass: "verte-picker__origin" }, [
        _c("canvas", {
          ref: "canvas",
          staticClass: "verte-picker__canvas",
          on: { mousedown: _vm.handleSelect, touchstart: _vm.handleSelect }
        }),
        _c("div", {
          ref: "cursor",
          staticClass: "verte-picker__cursor",
          style:
            "transform: translate3d(" +
            _vm.cursor.x +
            "px, " +
            _vm.cursor.y +
            "px, 0)"
        })
      ]),
      _vm.mode === "square"
        ? _c("slider", {
            staticClass: "verte-picker__slider",
            attrs: {
              gradient: [
                "#f00",
                "#ff0",
                "#0f0",
                "#0ff",
                "#00f",
                "#f0f",
                "#f00"
              ],
              editable: false,
              max: 360
            },
            model: {
              value: _vm.currentHue,
              callback: function($$v) {
                _vm.currentHue = $$v;
              },
              expression: "currentHue"
            }
          })
        : _vm._e(),
      _vm.mode === "wheel"
        ? _c("slider", {
            staticClass: "verte-picker__slider",
            attrs: {
              gradient: [
                "hsl(" +
                  _vm.currentColor.hue +
                  ",0%," +
                  _vm.currentColor.lum +
                  "%)",
                "hsl(" +
                  _vm.currentColor.hue +
                  ",100%," +
                  _vm.currentColor.lum +
                  "%)"
              ],
              editable: false,
              max: 100
            },
            model: {
              value: _vm.currentSat,
              callback: function($$v) {
                _vm.currentSat = $$v;
              },
              expression: "currentSat"
            }
          })
        : _vm._e()
    ],
    1
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* component normalizer */
  function __vue_normalize__$1(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script === 'function' ? script.options : script) || {};

    {
      component.__file = "/mnt/c/Users/Abdelrahman/Projects/verte/src/components/Picker.vue";
    }

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  function __vue_create_injector__$1() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__$1.styles || (__vue_create_injector__$1.styles = {});
    var isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) { el.setAttribute('media', css.media); }
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
          else { style.element.appendChild(textNode); }
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var Picker = __vue_normalize__$1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    __vue_create_injector__$1,
    undefined
  );

var MAX_COLOR_HISTROY = 6;
var Vue;
var store;

function initStore (_Vue, opts) {
  if (store) {
    return store;
  }

  opts = opts || {};
  var recentColors = opts.recentColors;
  var onRecentColorsChange = opts.onRecentColorsChange;

  Vue = _Vue;
  store = new Vue({
    data: function () { return ({
      recentColors: recentColors || newArray(6, getRandomColor)
    }); },
    methods: {
      addRecentColor: function addRecentColor (newColor) {
        if (this.recentColors.includes(newColor)) {
          return;
        }

        if (this.recentColors.length >= MAX_COLOR_HISTROY) {
          this.recentColors.pop();
        }

        this.recentColors.unshift(newColor);
        if (onRecentColorsChange) {
          onRecentColorsChange(this.recentColors);
        }
      }
    }
  });

  return store;
}

//

var script$2 = {
  name: 'Verte',
  components: {
    Picker: Picker,
    Slider: Slider
  },
  props: {
    picker: {
      type: String,
      default: 'square',
      validator: makeListValidator('picker', ['wheel', 'square'])
    },
    value: {
      type: String,
      default: '#000'
    },
    model: {
      type: String,
      default: 'hsl',
      validator: makeListValidator('model', ['rgb', 'hex', 'hsl'])
    },
    display: {
      type: String,
      default: 'picker',
      validator: makeListValidator('display', ['picker', 'widget'])
    },
    menuPosition: {
      type: String,
      default: 'bottom',
      validator: makeListValidator('menuPosition', ['top', 'bottom', 'left', 'right', 'center'])
    },
    showHistory: {
      type: Boolean,
      default: true
    },
    colorHistory: {
      type: Array,
      default: null
    },
    enableAlpha: {
      type: Boolean,
      default: true
    },
    rgbSliders: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  data: function () { return ({
    isMenuActive: true,
    isLoading: true,
    rgb: toRgb('#000'),
    hex: toHex('#000'),
    hsl: toHsl('#000'),
    delta: { x: 0, y: 0 },
    currentModel: '',
    internalColorHistory: []
  }); },
  computed: {
    $_verteStore: function $_verteStore () {
      // Should return the store singleton instance.
      return initStore();
    },
    historySource: function historySource () {
      if (this.colorHistory) {
        return this.internalColorHistory;
      }

      return this.$_verteStore.recentColors;
    },
    currentColor: {
      get: function get () {
        if (!this[this.model] && process.env.NODE_ENV !== 'production') {
          warn(("You are using a non-supported color model: \"" + (this.model) + "\", the supported models are: \"rgb\", \"hsl\" and \"hex\"."));
          return "rgb(0, 0, 0)";
        }

        return this[this.model].toString();
      },
      set: function set (val) {
        this.selectColor(val);
      }
    },
    alpha: {
      get: function get () {
        if (!this[this.model]) {
          return 1;
        }

        if (isNaN(this[this.model].alpha)) {
          return 1;
        }

        return this[this.model].alpha;
      },
      set: function set (val) {
        this[this.model].alpha = val;
        this.selectColor(this[this.model]);
      }
    },
    menuOnly: function menuOnly () {
      return this.display === 'widget';
    }
  },
  watch: {
    value: function value (val, oldVal) {
      if (val === oldVal || val === this.currentColor) { return; }

      // value was updated externally.
      this.selectColor(val);
    },
    rgb: {
      handler: function handler (val) {
        this.hex = toHex(val.toString());
        this.$emit('input', this.currentColor);
      },
      deep: true
    },
    colorHistory: function colorHistory (val) {
      if (this.internalColorHistory !== val) {
        this.internalColorHistory = [].concat( val );
      }
    }
  },
  beforeCreate: function beforeCreate () {
    // initialize the store early, _base is the vue constructor.
    initStore(this.$options._base);
  },
  // When used as a target for Vue.use
  install: function install (Vue, opts) {
    initStore(Vue, opts);
    Vue.component('Verte', this); // install self
  },
  created: function created () {
    if (this.colorHistory) {
      this.internalColorHistory = [].concat( this.colorHistory );
    }

    this.selectColor(this.value || '#000', true);
    this.currentModel = this.model;
  },
  mounted: function mounted () {
    var this$1 = this;

    // give sliders time to
    // calculate its visible width
    this.$nextTick(function () {
      this$1.isLoading = false;
      if (this$1.menuOnly) { return; }
      this$1.isMenuActive = false;
    });
  },
  methods: {
    selectColor: function selectColor (color, muted) {
      if ( muted === void 0 ) muted = false;

      if (!isValidColor(color)) { return; }

      this.rgb = toRgb(color);
      this.hex = toHex(color);
      this.hsl = toHsl(color);

      if (muted) { return; }
      this.$emit('input', this.currentColor);
    },
    switchModel: function switchModel () {
      var models = ['hex', 'rgb', 'hsl'];
      var indx = models.indexOf(this.currentModel);
      this.currentModel = models[indx + 1] || models[0];
    },
    handleMenuDrag: function handleMenuDrag (event) {
      var this$1 = this;

      if (event.button === 2) { return; }
      event.preventDefault();

      var lastMove = Object.assign({}, this.delta);
      var startPosition = getEventCords(event);

      var handleDragging = function (evnt) {
        window.requestAnimationFrame(function () {
          var endPosition = getEventCords(evnt);

          this$1.delta.x = lastMove.x + endPosition.x - startPosition.x;
          this$1.delta.y = lastMove.y + endPosition.y - startPosition.y;
        });
      };
      var handleRelase = function () {
        document.removeEventListener('mousemove', handleDragging);
        document.removeEventListener('mouseup', handleRelase);
        document.removeEventListener('touchmove', handleDragging);
        document.removeEventListener('touchup', handleRelase);
      };
      document.addEventListener('mousemove', handleDragging);
      document.addEventListener('mouseup', handleRelase);
      document.addEventListener('touchmove', handleDragging);
      document.addEventListener('touchup', handleRelase);
    },
    submit: function submit () {
      this.$emit('beforeSubmit', this.currentColor);
      this.addColorToHistory(this.currentColor);
      this.$emit('input', this.currentColor);
      this.$emit('submit', this.currentColor);
    },
    addColorToHistory: function addColorToHistory (color) {
      if (this.colorHistory) {
        if (this.internalColorHistory.length >= MAX_COLOR_HISTROY) {
          this.internalColorHistory.pop();
        }

        this.internalColorHistory.unshift(color);
        this.$emit('update:colorHistory', this.internalColorHistory);
        return;
      }

      this.$_verteStore.addRecentColor(this.currentColor);
    },
    inputChanged: function inputChanged (event, value) {
      var el = event.target;
      if (this.currentModel === 'hex') {
        this.selectColor(el.value);
        return;
      }
      var normalized = Math.min(Math.max(el.value, el.min), el.max);
      this[this.currentModel][value] = normalized;
      this.selectColor(this[this.currentModel]);
    },
    toggleMenu: function toggleMenu () {
      if (this.isMenuActive) {
        this.closeMenu();
        return;
      }
      this.openMenu();
    },
    closeMenu: function closeMenu () {
      this.isMenuActive = false;
      document.removeEventListener('mousedown', this.closeCallback);
      this.$emit('close', this.currentColor);
    },
    openMenu: function openMenu () {
      var this$1 = this;

      this.isMenuActive = true;
      this.closeCallback = function (evnt) {
        if (
          !isElementClosest(evnt.target, this$1.$refs.menu) &&
          !isElementClosest(evnt.target, this$1.$refs.guide)
        ) {
          this$1.closeMenu();
        }
      };
      document.addEventListener('mousedown', this.closeCallback);
    }
  }
};

/* script */
            var __vue_script__$2 = script$2;
/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "verte", class: { "verte--loading": _vm.isLoading } },
    [
      !_vm.menuOnly
        ? _c(
            "button",
            {
              ref: "guide",
              staticClass: "verte__guide",
              style:
                "color: " +
                _vm.currentColor +
                "; fill: " +
                _vm.currentColor +
                ";",
              attrs: { type: "button" },
              on: { click: _vm.toggleMenu }
            },
            [
              _vm._t("default", [
                _c(
                  "svg",
                  {
                    staticClass: "verte__icon",
                    attrs: { viewBox: "0 0 24 24" }
                  },
                  [
                    _c(
                      "pattern",
                      {
                        attrs: {
                          id: "checkerboard",
                          width: "6",
                          height: "6",
                          patternUnits: "userSpaceOnUse",
                          fill: "FFF"
                        }
                      },
                      [
                        _c("rect", {
                          attrs: {
                            fill: "#7080707f",
                            x: "0",
                            width: "3",
                            height: "3",
                            y: "0"
                          }
                        }),
                        _c("rect", {
                          attrs: {
                            fill: "#7080707f",
                            x: "3",
                            width: "3",
                            height: "3",
                            y: "3"
                          }
                        })
                      ]
                    ),
                    _c("circle", {
                      attrs: {
                        cx: "12",
                        cy: "12",
                        r: "12",
                        fill: "url(#checkerboard)"
                      }
                    }),
                    _c("circle", { attrs: { cx: "12", cy: "12", r: "12" } })
                  ]
                )
              ])
            ],
            2
          )
        : _vm._e(),
      _c(
        "div",
        {
          staticClass: "verte__menu-origin",
          class: [
            "verte__menu-origin--" + _vm.menuPosition,
            {
              "verte__menu-origin--static": _vm.menuOnly,
              "verte__menu-origin--active": _vm.isMenuActive
            }
          ]
        },
        [
          _c(
            "div",
            {
              ref: "menu",
              staticClass: "verte__menu",
              style:
                "transform: translate(" +
                _vm.delta.x +
                "px, " +
                _vm.delta.y +
                "px)",
              attrs: { tabindex: "-1" }
            },
            [
              !_vm.menuOnly
                ? _c(
                    "button",
                    {
                      staticClass: "verte__close",
                      attrs: { type: "button" },
                      on: { click: _vm.closeMenu }
                    },
                    [
                      _c(
                        "svg",
                        {
                          staticClass: "verte__icon verte__icon--small",
                          attrs: { viewBox: "0 0 24 24" }
                        },
                        [
                          _c("title", [_vm._v("Close Icon")]),
                          _c("path", {
                            attrs: {
                              d:
                                "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                            }
                          })
                        ]
                      )
                    ]
                  )
                : _vm._e(),
              _vm.draggable && !_vm.menuOnly
                ? _c("div", {
                    staticClass: "verte__draggable",
                    on: {
                      mousedown: _vm.handleMenuDrag,
                      touchstart: _vm.handleMenuDrag
                    }
                  })
                : _vm._e(),
              _c("Picker", {
                attrs: { mode: _vm.picker, alpha: _vm.alpha },
                model: {
                  value: _vm.currentColor,
                  callback: function($$v) {
                    _vm.currentColor = $$v;
                  },
                  expression: "currentColor"
                }
              }),
              _c(
                "div",
                { staticClass: "verte__controller" },
                [
                  _vm.enableAlpha
                    ? _c("Slider", {
                        attrs: {
                          gradient: [
                            "rgba(" +
                              _vm.rgb.red +
                              ", " +
                              _vm.rgb.green +
                              ", " +
                              _vm.rgb.blue +
                              ", 0)",
                            "rgba(" +
                              _vm.rgb.red +
                              ", " +
                              _vm.rgb.green +
                              ", " +
                              _vm.rgb.blue +
                              ", 1)"
                          ],
                          min: 0,
                          max: 1,
                          step: 0.01,
                          editable: false
                        },
                        model: {
                          value: _vm.alpha,
                          callback: function($$v) {
                            _vm.alpha = $$v;
                          },
                          expression: "alpha"
                        }
                      })
                    : _vm._e(),
                  _vm.rgbSliders
                    ? [
                        _c("Slider", {
                          attrs: {
                            gradient: [
                              "rgb(0," +
                                _vm.rgb.green +
                                "," +
                                _vm.rgb.blue +
                                ")",
                              "rgb(255," +
                                _vm.rgb.green +
                                "," +
                                _vm.rgb.blue +
                                ")"
                            ]
                          },
                          model: {
                            value: _vm.rgb.red,
                            callback: function($$v) {
                              _vm.$set(_vm.rgb, "red", $$v);
                            },
                            expression: "rgb.red"
                          }
                        }),
                        _c("Slider", {
                          attrs: {
                            gradient: [
                              "rgb(" + _vm.rgb.red + ",0," + _vm.rgb.blue + ")",
                              "rgb(" +
                                _vm.rgb.red +
                                ",255," +
                                _vm.rgb.blue +
                                ")"
                            ]
                          },
                          model: {
                            value: _vm.rgb.green,
                            callback: function($$v) {
                              _vm.$set(_vm.rgb, "green", $$v);
                            },
                            expression: "rgb.green"
                          }
                        }),
                        _c("Slider", {
                          attrs: {
                            gradient: [
                              "rgb(" +
                                _vm.rgb.red +
                                "," +
                                _vm.rgb.green +
                                ",0)",
                              "rgb(" +
                                _vm.rgb.red +
                                "," +
                                _vm.rgb.green +
                                ",255)"
                            ]
                          },
                          model: {
                            value: _vm.rgb.blue,
                            callback: function($$v) {
                              _vm.$set(_vm.rgb, "blue", $$v);
                            },
                            expression: "rgb.blue"
                          }
                        })
                      ]
                    : _vm._e(),
                  _c(
                    "div",
                    { staticClass: "verte__inputs" },
                    [
                      _c(
                        "button",
                        {
                          staticClass: "verte__model",
                          attrs: { type: "button" },
                          on: { click: _vm.switchModel }
                        },
                        [_vm._v(_vm._s(_vm.currentModel))]
                      ),
                      _vm.currentModel === "hsl"
                        ? [
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "number", max: "360", min: "0" },
                              domProps: { value: _vm.hsl.hue },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "hue");
                                }
                              }
                            }),
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "number", min: "0", max: "100" },
                              domProps: { value: _vm.hsl.sat },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "sat");
                                }
                              }
                            }),
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "number", min: "0", max: "100" },
                              domProps: { value: _vm.hsl.lum },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "lum");
                                }
                              }
                            })
                          ]
                        : _vm._e(),
                      _vm.currentModel === "rgb"
                        ? [
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "number", min: "0", max: "255" },
                              domProps: { value: _vm.rgb.red },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "red");
                                }
                              }
                            }),
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "number", min: "0", max: "255" },
                              domProps: { value: _vm.rgb.green },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "green");
                                }
                              }
                            }),
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "number", min: "0", max: "255" },
                              domProps: { value: _vm.rgb.blue },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "blue");
                                }
                              }
                            })
                          ]
                        : _vm._e(),
                      _vm.currentModel === "hex"
                        ? [
                            _c("input", {
                              staticClass: "verte__input",
                              attrs: { type: "text" },
                              domProps: { value: _vm.hex },
                              on: {
                                change: function($event) {
                                  _vm.inputChanged($event, "hex");
                                }
                              }
                            })
                          ]
                        : _vm._e(),
                      _c(
                        "button",
                        {
                          staticClass: "verte__submit",
                          attrs: { type: "button" },
                          on: { click: _vm.submit }
                        },
                        [
                          _c("title", [_vm._v("Submit Icon")]),
                          _c(
                            "svg",
                            {
                              staticClass: "verte__icon",
                              attrs: { viewBox: "0 0 24 24" }
                            },
                            [
                              _c("path", {
                                attrs: {
                                  d:
                                    "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                                }
                              })
                            ]
                          )
                        ]
                      )
                    ],
                    2
                  ),
                  _vm.showHistory
                    ? _c(
                        "div",
                        { ref: "recent", staticClass: "verte__recent" },
                        _vm._l(_vm.historySource, function(clr) {
                          return _c("a", {
                            staticClass: "verte__recent-color",
                            style: "color: " + clr,
                            attrs: { role: "button", href: "#" },
                            on: {
                              click: function($event) {
                                $event.preventDefault();
                                _vm.selectColor(clr);
                              }
                            }
                          })
                        })
                      )
                    : _vm._e()
                ],
                2
              )
            ],
            1
          )
        ]
      )
    ]
  )
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  var __vue_inject_styles__$2 = undefined;
  /* scoped */
  var __vue_scope_id__$2 = undefined;
  /* module identifier */
  var __vue_module_identifier__$2 = undefined;
  /* functional template */
  var __vue_is_functional_template__$2 = false;
  /* component normalizer */
  function __vue_normalize__$2(
    template, style, script,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script === 'function' ? script.options : script) || {};

    {
      component.__file = "/mnt/c/Users/Abdelrahman/Projects/verte/src/components/Verte.vue";
    }

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  function __vue_create_injector__$2() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__$2.styles || (__vue_create_injector__$2.styles = {});
    var isOldIE =
      typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) { return } // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) { el.setAttribute('media', css.media); }
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts
            .filter(Boolean)
            .join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) { style.element.removeChild(nodes[index]); }
          if (nodes.length) { style.element.insertBefore(textNode, nodes[index]); }
          else { style.element.appendChild(textNode); }
        }
      }
    }
  }
  /* style inject SSR */
  

  
  var Verte = __vue_normalize__$2(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    __vue_create_injector__$2,
    undefined
  );

export default Verte;
