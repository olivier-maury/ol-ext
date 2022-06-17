import ol_ext_inherits from '../ext'
import ol_ext_element from '../element';
import ol_ext_input_Base from './Base'

/** Checkbox input
 * @constructor
 * @extends {ol_ext_input_Base}
 * @param {*} options
 *  @param {string} [options.className]
 *  @param {Element} [options.input] input element, if non create one (use parent to tell where)
 *  @param {Element} [options.parent] element to use as parent if no input option
 *  @param {booelan} [options.hover=true] show popup on hover
 *  @param {string} [options.align=left] align popup left/right
 *  @param {string} [options.type] a slide type as 'size'
 *  @param {number} [options.min] min value, default use input min
 *  @param {number} [options.max] max value, default use input max
 *  @param {number} [options.step] step value, default use input step
 *  @param {boolean} [options.overflow=false] enable values over min/max
 *  @param {string|Element} [options.before] an element to add before the slider
 *  @param {string|Element} [options.after] an element to add after the slider
 *  @param {boolean} [options.fixed=false] no pupop
 */
var ol_ext_input_Range = function(options) {
  options = options || {};

  ol_ext_input_Base.call(this, options);
  this.set('overflow', !!options.overflow);

  this.element = ol_ext_element.create('DIV', {
    className: 'ol-input-slider ol-input-range' 
      + (options.className ? ' ' + options.className : '')
  });

  var input = this.input;
  if (input.parentNode) input.parentNode.insertBefore(this.element, input);
  this.element.appendChild(input);

  // Slider
  var slider = this.slider = ol_ext_element.create('DIV', {
    className: 'ol-slider',
    parent: this.element
  });
  var back = ol_ext_element.create('DIV', {
    className: 'ol-back',
    parent: this.slider
  })

  var input2 = this.input2 = options.input2;
  if(input2) this.element.appendChild(input2);

  // Cursors
  var cursor = ol_ext_element.create('DIV', {
    className: 'ol-cursor',
    parent: slider
  })
  var cursor2 = ol_ext_element.create('DIV', {
    className: 'ol-cursor',
    parent: input2 ? slider : undefined
  })

  var currentCursor = cursor;
  function setCursor(e) {
    currentCursor = e.target;
  }
  cursor.addEventListener('mousedown', setCursor, false);
  cursor.addEventListener('touchstart', setCursor, false);
  cursor2.addEventListener('mousedown', setCursor, false);
  cursor2.addEventListener('touchstart', setCursor, false);

  var min = (options.min !== undefined) ? options.min : parseFloat(input.min) || 0;
  var max = (options.max !== undefined) ? options.max : parseFloat(input.max) || 1;
  var step = (options.step !== undefined) ? options.step : parseFloat(input.step) || 1;
  var dstep = 1/step;

  function setRange() {
    // range
    if (input2) {
      var l1 = parseFloat(cursor.style.left) || 0;
      var l2 = parseFloat(cursor2.style.left) || 0;
      back.style.left = Math.min(l1, l2) + '%';
      back.style.right = (100 - Math.max(l1, l2)) + '%';
    } else {
      back.style.left = 0;
      back.style.right = (100 - parseFloat(cursor.style.left) || 0) + '%';
    }
  }
  function checkMinMax() {
    if (input2 && parseFloat(input.value) > parseFloat(input2.value)) {
      var v = input.value;
      input.value = input2.value;
      input2.value = v;
      setValue({ target: input });
      if (input2) setValue({ target: input2 });
    }
  }
  // Handle popup drag
  this._listenDrag(slider, function(e) {
    var current = (currentCursor===cursor ? input : input2);
    var tx = Math.max(0, Math.min(e.offsetX / slider.clientWidth, 1));
    currentCursor.style.left = Math.max(0, Math.min(100, Math.round(tx*100) )) + '%';
    var v = current.value = Math.round((tx * (max - min) + min) * dstep) / dstep;
    setRange();
    this.dispatchEvent({ type: 'change:value', value: v });
    if (e.type==='pointerup') {
      checkMinMax();
    }
  }.bind(this));

  // Set value
  var setValue = function(e) {
    var current = e.target;
    var curs = (current===input ? cursor : cursor2);
    var v = parseFloat(current.value) || 0;
    if (!this.get('overflow')) v = Math.max(min, Math.min(max, v));
    if (v != current.value) current.value = v;
    var tx = (v - min) / (max - min);
    curs.style.left = Math.max(0, Math.min(100, Math.round(tx*100) )) + '%';
    setRange();
    this.dispatchEvent({ type: 'change:value', value: v });
    checkMinMax();
  }.bind(this);

  input.addEventListener('change', setValue);
  if (input2) input2.addEventListener('change', setValue);

  setValue({ target: input });
  if (input2) setValue({ target: input2 });
};
ol_ext_inherits(ol_ext_input_Range, ol_ext_input_Base);

/** Set the current value (second input)
 */
ol_ext_input_Base.prototype.setValue2 = function(v) {
  if (!this.input2) return;
  if (v !== undefined) this.input2.value = v;
  this.input2.dispatchEvent(new Event('change'));
};
  
export default ol_ext_input_Range
