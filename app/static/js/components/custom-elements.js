// FLOAT INPUT
// Example: <unicorn-float-input title="Width" min="320" max="1600" step="8" value="512" unit="px"></unicorn-float-input>
class UnicornFloatInput extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    width: 180px;
                }
                :host * {
                    font-family: Arial, Helvetica, sans-serif;
                }

                .title {
                    margin: 0;
                    opacity: 0.5;
                }

                .unicorn-float-input-container {
                    display: flex;
                    align-items: center;
                    height: 38px;
                    width: 100%;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    background-color: #fff;
                    outline: 0px solid #4488dd00;
                }

                .unicorn-float-input-container:focus-within {
                    outline: 2px solid #4488dd;
                }

                .unicorn-float-textarea {
                    width: calc(100% - 40px);
                    height: 100%;
                    font-size: 18px;
                    text-align: left;
                    padding: 0px 0px 0px 10px;
                    border: none;
                    outline: none;
                    resize: none;
                    overflow: hidden;
                    white-space: nowrap;
                    line-height: 38px;
                }

                .unicorn-float-unit {
                    color: #888;
                    padding: 0px 8px 0px 0px;
                    background-color: #fff;
                    margin: 0;
                    user-select: none;
                    pointer-events: none;
                }
                
                .unicorn-float-buttons {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-evenly;
                    height: 100%;
                    border-left: 1px solid #ddd;
                }

                .unicorn-float-input-button {
                    width: 30px;
                    height: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .unicorn-float-input-button:hover {
                    background-color: #4488dd33;
                }

                .unicorn-float-input-button svg {
                    fill: #4488dd;
                    width: 16px;
                    height: 16px;
                }
                
            </style>
            <h4 class="title"></h4>
            <div class="unicorn-float-input-container">
                <textarea class="unicorn-float-textarea" id="value"></textarea>
                <p class="unicorn-float-unit"></p>
                <div class="unicorn-float-buttons">
                    <div class="unicorn-float-input-button up" id="increase" tabindex="0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/></svg>
                    </div>
                    <div class="unicorn-float-input-button down" id="decrease" tabindex="0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                    </div>
                </div>
            </div>
        `;

        this.titleElement = this.shadowRoot.querySelector('.title');
        this.textarea = this.shadowRoot.querySelector('#value');
        this.decreaseButton = this.shadowRoot.querySelector('#decrease');
        this.increaseButton = this.shadowRoot.querySelector('#increase');
        this.unitElement = this.shadowRoot.querySelector('.unicorn-float-unit');

        this.min = parseFloat(this.getAttribute('min')) || 0;
        this.max = parseFloat(this.getAttribute('max')) || 99999;
        this.step = parseFloat(this.getAttribute('step')) || 0.5;
        this.value = parseFloat(this.getAttribute('value')) || this.min;
        this.unit = this.getAttribute('unit') || 'px';
        this.title = this.getAttribute('title') || '';

        this.updateDisplay();
        this.updateUnit();
        this.updateTitle();
        this.attachEventListeners();
        
        this.textarea.addEventListener('focus', () => {
            this.textarea.select(); // Automatically highlight all text on focus
        });
        
        this.textarea.addEventListener('mousedown', (event) => {
            event.preventDefault(); // Prevent default cursor placement
            this.textarea.focus(); // Ensure the textarea is focused
            this.textarea.select(); // Select all the text
        });

        this.textarea.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || (event.key === 'Enter' && event.shiftKey)) {
                event.preventDefault(); // Prevent default behavior for Enter key
                this.textarea.blur(); // Remove focus from textarea
            }
        });

        // Debounce timer
        this.debounceTimeout = null;
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'value', 'unit', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'min') {
            this.min = parseFloat(newValue);
            this.value = Math.max(this.value, this.min);
            this.updateDisplay();
        }
        if (name === 'max') {
            this.max = parseFloat(newValue);
            this.value = Math.min(this.value, this.max);
            this.updateDisplay();
        }
        if (name === 'step') {
            this.step = parseFloat(newValue);
        }
        if (name === 'value') {
            this.value = Math.max(this.min, Math.min(this.max, parseFloat(newValue)));
            this.updateDisplay();
        }
        if (name === 'unit') {
            this.unit = newValue;
            this.updateUnit();
        }
        if (name === 'title') {
            this.title = newValue;
            this.updateTitle();
        }
    }

    attachEventListeners() {
        this.addHoldButtonListener(this.increaseButton, this.step);
        this.addHoldButtonListener(this.decreaseButton, -this.step);

        this.textarea.addEventListener('input', () => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                let newValue = this.textarea.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
                if (newValue === '' || isNaN(parseFloat(newValue))) {
                    newValue = this.min; // Set to min if empty or invalid
                }
                newValue = parseFloat(newValue);
                this.value = this.roundToStep(Math.max(this.min, Math.min(this.max, newValue)));
                this.setAttribute('value', this.value);
                this.updateDisplay();
            }, 1000); // 1 second debounce time
        });

        this.textarea.addEventListener('blur', () => {
            clearTimeout(this.debounceTimeout);
            let newValue = this.textarea.value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
            if (newValue === '' || isNaN(parseFloat(newValue))) {
                newValue = this.min; // Set to min if empty or invalid
            }
            newValue = parseFloat(newValue);
            this.value = this.roundToStep(Math.max(this.min, Math.min(this.max, newValue)));
            this.setAttribute('value', this.value);
            this.updateDisplay();
        });

        // Prevent line breaks and only allow numeric input
        this.textarea.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || (event.key === 'Enter' && event.shiftKey)) {
                event.preventDefault();
            }
        });

        // Only allow numbers and decimal points
        this.textarea.addEventListener('input', (event) => {
            let value = this.textarea.value;
            if (!/^\d*\.?\d*$/.test(value)) { // Regular expression to allow only numbers and one decimal point
                this.textarea.value = value.replace(/[^0-9.]/g, '');
            }
        });
    }

    addHoldButtonListener(button, delta) {
        let timer;
        let rapidChangeInterval;

        const startChange = () => {
            this.changeValue(delta);
            timer = setTimeout(() => {
                rapidChangeInterval = setInterval(() => this.changeValue(delta), 50); // 20 steps per second
            }, 500); // Start rapid change after 500ms
        };

        const stopChange = () => {
            clearTimeout(timer);
            clearInterval(rapidChangeInterval);
        };

        button.addEventListener('mousedown', startChange);
        button.addEventListener('mouseup', stopChange);
        button.addEventListener('mouseleave', stopChange);
        button.addEventListener('touchstart', startChange);
        button.addEventListener('touchend', stopChange);
        button.addEventListener('touchcancel', stopChange);
    }

    changeValue(delta) {
        this.value = this.roundToStep(Math.max(this.min, Math.min(this.max, this.value + delta)));
        this.setAttribute('value', this.value);
        this.updateDisplay();
    }

    roundToStep(value) {
        const factor = 1 / this.step;
        return Math.round(value * factor) / factor;
    }

    updateDisplay() {
        this.textarea.value = this.value;
    }

    updateUnit() {
        this.unitElement.textContent = this.unit;
    }

    updateTitle() {
        this.titleElement.textContent = this.title;
    }
} customElements.define('unicorn-float-input', UnicornFloatInput);

// RANGE INPUT
// Example: <unicorn-range title="Speed" min="0" max="20" step="0.5" value="15" expose="top"></unicorn-range>
class UnicornRange extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    max-width: 100%;
                    width: 200px;
                    margin: 20px;
                }
                :host * {
                    font-family: Arial, Helvetica, sans-serif;
                }

                .title {
                    margin: 0px;
                    opacity: 0.5;
                }

                .unicorn-range-container {
                    flex: 1;
                    margin-right: 16px;
                }

                .unicorn-range-track {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 4px;
                    min-width: 60px;
                    border-radius: 100px;
                    background-image: linear-gradient(to right, var(--primary) 0%, var(--back4) 0%);
                    margin: 0px 6px;
                }

                .unicorn-range-thumb {
                    position: absolute;
                    top: 50%;
                    width: 12px;
                    height: 20px;
                    background-color: var(--font2);
                    outline: 0px solid #4488dd00;
                    border-radius: 3px;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    transition: outline 0.1s;
                }

                .unicorn-range-thumb:hover, .unicorn-range-thumb.focus {
                    outline: 5px solid #4488dd66;
                }

                .unicorn-range-value {
                    color: var(--font1);
                    font-weight: 600;
                    position: absolute;
                    display: flex;
                    opacity: 0;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    background: var(--primary);
                    width: 30px;
                    height: 20px;
                    border-radius: 4px;
                    white-space: nowrap;
                    transition: opacity 0.2s;
                    pointer-events: none;
                    user-select: none;
                }
                
                .unicorn-range-thumb:hover + .unicorn-range-value {
                    opacity: 1;
                }
            </style>
            <h4 class="title"></h4>
            <div class="unicorn-range-container">
                <div class="unicorn-range-track">
                    <div class="unicorn-range-thumb"></div>
                    <div class="unicorn-range-value"></div>
                </div>
            </div>
        `;
        this.titleElement = this.shadowRoot.querySelector('.title');
        this.container = this.shadowRoot.querySelector('.unicorn-range-container');
        this.track = this.shadowRoot.querySelector('.unicorn-range-track');
        this.thumb = this.shadowRoot.querySelector('.unicorn-range-thumb');
        this.valueDisplay = this.shadowRoot.querySelector('.unicorn-range-value');
        this.isDragging = false;

        this.attachEventListeners();
        this.updateAttributes();
        this.setInitialThumbPosition();
        this.updateValueDisplay();
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'value', 'expose', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = parseFloat(newValue) || newValue;
            this.updateAttributes();
            this.setInitialThumbPosition();
            this.updateValueDisplay();
        }
    }

    attachEventListeners() {
        // Mouse events
        this.thumb.addEventListener('mousedown', () => {
            this.startDrag();
        });
        document.addEventListener('mouseup', () => {
            this.stopDrag();
        });
        document.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.updateSlider(event.clientX);
            }
        });

        // Touch events
        this.thumb.addEventListener('touchstart', () => {
            this.startDrag();
        });
        document.addEventListener('touchend', () => {
            this.stopDrag();
        });
        document.addEventListener('touchmove', (event) => {
            if (this.isDragging) {
                this.updateSlider(event.touches[0].clientX);
            }
        });

        // Click on track to move thumb and initiate dragging
        this.track.addEventListener('mousedown', (event) => {
            this.handleTrackClick(event);
            this.startDrag(); // Start dragging immediately after the click
        });

        this.track.addEventListener('mouseleave', () => {
            if (!this.isDragging && this.expose !== 'none') {
                this.hideValueDisplay();
            }
        });
    }

    startDrag() {
        this.isDragging = true;
        this.thumb.classList.add('focus');
        if (this.expose !== 'none') this.showValueDisplay();
    }

    stopDrag() {
        this.isDragging = false;
        this.thumb.classList.remove('focus');
        if (this.expose !== 'none') this.hideValueDisplay();
    }

    updateAttributes() {
        this.min = parseFloat(this.getAttribute('min')) || 0;
        this.max = parseFloat(this.getAttribute('max')) || 10;
        this.step = parseFloat(this.getAttribute('step')) || 1;
        this.value = parseFloat(this.getAttribute('value')) || this.min;
        this.expose = this.getAttribute('expose') || 'top';
        this.titleElement.textContent = this.getAttribute('title') || '';

        if (this.expose === 'none' || this.expose === '') {
            this.valueDisplay.style.display = 'none';
        } else {
            this.valueDisplay.style.display = 'flex';
        }

        this.updateDisplayPosition();
    }

    setInitialThumbPosition() {
        const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
        this.thumb.style.left = `${percentage}%`;
        this.track.style.backgroundImage = `linear-gradient(to right, var(--primary) ${percentage}%, var(--back4) ${percentage}%)`;
    }

    roundToStep(value) {
        const factor = 1 / this.step;
        return Math.round(value * factor) / factor;
    }

    updateSlider(mouseX) {
        const trackRect = this.track.getBoundingClientRect();
        const trackWidth = trackRect.width;
        const trackLeft = trackRect.left;

        let thumbPosition = mouseX - trackLeft;
        if (thumbPosition < 0) thumbPosition = 0;
        if (thumbPosition > trackWidth) thumbPosition = trackWidth;

        let percentage = (thumbPosition / trackWidth) * 100;
        let newValue = (percentage / 100) * (this.max - this.min) + this.min;
        newValue = this.roundToStep(newValue); // Use roundToStep for precision

        if (newValue < this.min) newValue = this.min;
        if (newValue > this.max) newValue = this.max;

        percentage = ((newValue - this.min) / (this.max - this.min)) * 100;
        this.thumb.style.left = `${percentage}%`;
        this.track.style.backgroundImage = `linear-gradient(to right, var(--primary) ${percentage}%, var(--back4) ${percentage}%)`;

        this.value = newValue;
        this.setAttribute('value', this.value);
        this.updateValueDisplay();
    }

    handleTrackClick(event) {
        const trackRect = this.track.getBoundingClientRect();
        const clickX = event.clientX - trackRect.left;
        this.updateSlider(clickX + trackRect.left);
    }

    updateValueDisplay() {
        if (this.expose !== 'none') {
            this.valueDisplay.textContent = this.value;
            this.updateDisplayPosition();
        }
    }

    updateDisplayPosition() {
        if (this.expose === 'none') return;

        const thumbRect = this.thumb.getBoundingClientRect();
        const trackRect = this.track.getBoundingClientRect();
        const valueRect = this.valueDisplay.getBoundingClientRect();
        
        const thumbCenterX = thumbRect.left + thumbRect.width / 2 - trackRect.left;
        const thumbCenterY = thumbRect.top - trackRect.top + thumbRect.height / 2;
        
        if (this.expose === 'top') {
            this.valueDisplay.style.left = `${thumbCenterX - valueRect.width / 2}px`;
            this.valueDisplay.style.top = `${thumbRect.top - trackRect.top - valueRect.height - 8}px`;
        } else if (this.expose === 'bottom') {
            this.valueDisplay.style.left = `${thumbCenterX - valueRect.width / 2}px`;
            this.valueDisplay.style.top = `${thumbRect.top - trackRect.top + thumbRect.height + 8}px`;
        } else if (this.expose === 'left') {
            this.valueDisplay.style.left = `${-valueRect.width - 12}px`;
            this.valueDisplay.style.top = `${thumbCenterY - valueRect.height / 2}px`;
        } else if (this.expose === 'right') {
            this.valueDisplay.style.left = `${trackRect.width + 12}px`;
            this.valueDisplay.style.top = `${thumbCenterY - valueRect.height / 2}px`;
        }
    }

    showValueDisplay() {
        if (this.expose !== 'none') {
            this.valueDisplay.style.opacity = '1';
            this.updateValueDisplay();
        }
    }

    hideValueDisplay() {
        if (this.expose !== 'none') {
            this.valueDisplay.style.opacity = '0';
        }
    }
} customElements.define('unicorn-range', UnicornRange);

// SPLIT RANGE INPUT
// Example: <unicorn-split-range title="Range" min="0" max="100" step="5" min-dif="20" max-dif="80" fill-start="false" value1="30" value2="70" expose="bottom"></unicorn-split-range>
class UnicornSplitRange extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                :host * {
                    font-family: Arial, Helvetica, sans-serif;
                }

                .title {
                    margin: 0px;
                    opacity: 0.5;
                }

                .unicorn-range-container {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 38px;
                    position: relative;
                }

                .unicorn-range-track {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 4px;
                    min-width: 60px;
                    background-color: #ccc;
                    border-radius: 100px;
                    margin: 0px 10px;
                }

                .unicorn-range-track-filled {
                    position: absolute;
                    height: 100%;
                    background-color: #4488dd;
                    border-radius: 100px;
                    pointer-events: none;
                }

                .unicorn-range-thumb {
                    position: absolute;
                    top: 50%;
                    width: 20px;
                    height: 20px;
                    background-color: #fff;
                    border: 1px solid #ddd;
                    outline: 0px solid #4488dd00;
                    border-radius: 100px;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    transition: outline 0.1s;
                }

                .unicorn-range-thumb:hover, .unicorn-range-thumb.focus {
                    outline: 5px solid #4488dd66;
                }

                .unicorn-range-value {
                    color: #fff;
                    font-weight: 600;
                    position: absolute;
                    display: flex;
                    opacity: 0;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    background: #4488dd;
                    width: 30px;
                    height: 20px;
                    border-radius: 4px;
                    white-space: nowrap;
                    transition: opacity 0.2s;
                    pointer-events: none;
                    user-select: none;
                }

                .title {
                    margin: 0;
                    opacity: 0.5;
                }
            </style>
            <h4 class="title"></h4>
            <div class="unicorn-range-container">
                <div class="unicorn-range-track">
                    <div class="unicorn-range-track-filled"></div>
                    <div class="unicorn-range-thumb" id="thumb1"></div>
                    <div class="unicorn-range-thumb" id="thumb2"></div>
                    <div class="unicorn-range-value" id="value1"></div>
                    <div class="unicorn-range-value" id="value2"></div>
                </div>
            </div>
        `;

        this.titleElement = this.shadowRoot.querySelector('.title');
        this.container = this.shadowRoot.querySelector('.unicorn-range-container');
        this.track = this.shadowRoot.querySelector('.unicorn-range-track');
        this.trackFilled = this.shadowRoot.querySelector('.unicorn-range-track-filled');
        this.thumb1 = this.shadowRoot.querySelector('#thumb1');
        this.thumb2 = this.shadowRoot.querySelector('#thumb2');
        this.valueDisplay1 = this.shadowRoot.querySelector('#value1');
        this.valueDisplay2 = this.shadowRoot.querySelector('#value2');
        this.isDragging = false;
        this.draggingThumb = null;

        this.attachEventListeners();
        this.updateAttributes(); // This will trigger position setup
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'value1', 'value2', 'expose', 'min-dif', 'max-dif', 'fill-start', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = parseFloat(newValue) || newValue;
            this.updateAttributes();
        }
    }

    attachEventListeners() {
        // Mouse events
        this.thumb1.addEventListener('mousedown', () => this.startDragging('thumb1'));
        this.thumb2.addEventListener('mousedown', () => this.startDragging('thumb2'));
        document.addEventListener('mouseup', () => this.stopDragging());
        document.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                this.updateSlider(event.clientX);
            }
        });

        // Touch events
        this.thumb1.addEventListener('touchstart', () => this.startDragging('thumb1'));
        this.thumb2.addEventListener('touchstart', () => this.startDragging('thumb2'));
        document.addEventListener('touchend', () => this.stopDragging());
        document.addEventListener('touchmove', (event) => {
            if (this.isDragging) {
                this.updateSlider(event.touches[0].clientX);
            }
        });

        // Hover events on thumbs
        this.thumb1.addEventListener('mouseenter', () => {
            if (this.expose !== 'none') this.showValueDisplay(this.valueDisplay1);
        });
        this.thumb1.addEventListener('mouseleave', () => {
            if (!this.isDragging && this.expose !== 'none') this.hideValueDisplay(this.valueDisplay1);
        });
        this.thumb2.addEventListener('mouseenter', () => {
            if (this.expose !== 'none') this.showValueDisplay(this.valueDisplay2);
        });
        this.thumb2.addEventListener('mouseleave', () => {
            if (!this.isDragging && this.expose !== 'none') this.hideValueDisplay(this.valueDisplay2);
        });
    }

    startDragging(thumb) {
        this.isDragging = true;
        this.draggingThumb = thumb;
        this.shadowRoot.querySelector(`#${thumb}`).classList.add('focus');
        if (this.expose !== 'none') this.showValueDisplay(this.shadowRoot.querySelector(`#${thumb.replace('thumb', 'value')}`));
    }

    stopDragging() {
        this.isDragging = false;
        if (this.draggingThumb) {
            this.shadowRoot.querySelector(`#${this.draggingThumb}`).classList.remove('focus');
            if (this.expose !== 'none') this.hideValueDisplay(this.shadowRoot.querySelector(`#${this.draggingThumb.replace('thumb', 'value')}`));
        }
        this.draggingThumb = null;
    }

    updateAttributes() {
        this.min = parseFloat(this.getAttribute('min')) || 0;
        this.max = parseFloat(this.getAttribute('max')) || 100;
        this.step = parseFloat(this.getAttribute('step')) || 1;
        this.value1 = parseFloat(this.getAttribute('value1')) || this.min;
        this.value2 = parseFloat(this.getAttribute('value2')) || this.max;
        this.minDif = parseFloat(this.getAttribute('min-dif')) || 0;
        this.maxDif = parseFloat(this.getAttribute('max-dif')) || Infinity;
        this.expose = this.getAttribute('expose') || 'top';
        this.fillStart = this.getAttribute('fill-start') === 'true'; // new

        if (this.expose === 'none' || this.expose === '') {
            this.valueDisplay1.style.display = 'none';
            this.valueDisplay2.style.display = 'none';
        } else {
            this.valueDisplay1.style.display = 'flex';
            this.valueDisplay2.style.display = 'flex';
        }

        this.setInitialThumbPositions(); // Make sure positions are set after attributes are updated
        this.updateValueDisplays();
        this.titleElement.textContent = this.getAttribute('title') || '';
    }

    setInitialThumbPositions() {
        const percentage1 = ((this.value1 - this.min) / (this.max - this.min)) * 100;
        const percentage2 = ((this.value2 - this.min) / (this.max - this.min)) * 100;

        this.thumb1.style.left = `${percentage1}%`;
        this.thumb2.style.left = `${percentage2}%`;

        if (this.fillStart) {
            // Fill the track from the start to the first thumb
            this.trackFilled.style.left = `0%`;
            this.trackFilled.style.width = `${percentage2}%`;
        } else {
            // Fill the track from the first thumb to the second thumb
            this.trackFilled.style.left = `${percentage1}%`;
            this.trackFilled.style.width = `${percentage2 - percentage1}%`;
        }

        this.updateValueDisplays();
    }

    roundToStep(value) {
        const factor = 1 / this.step;
        return Math.round(value * factor) / factor;
    }

    updateSlider(mouseX) {
        const trackRect = this.track.getBoundingClientRect();
        const trackWidth = trackRect.width;
        const trackLeft = trackRect.left;

        let thumbPosition = mouseX - trackLeft;
        if (thumbPosition < 0) thumbPosition = 0;
        if (thumbPosition > trackWidth) thumbPosition = trackWidth;

        let percentage = (thumbPosition / trackWidth) * 100;
        let newValue = (percentage / 100) * (this.max - this.min) + this.min;
        newValue = this.roundToStep(newValue); // Use roundToStep for precision

        if (newValue < this.min) newValue = this.min;
        if (newValue > this.max) newValue = this.max;

        if (this.draggingThumb === 'thumb1') {
            if (this.value2 - newValue < this.minDif) {
                newValue = this.value2 - this.minDif;
            }
            if (this.value2 - newValue > this.maxDif) {
                newValue = this.value2 - this.maxDif;
            }
            this.value1 = newValue;
        } else if (this.draggingThumb === 'thumb2') {
            if (newValue - this.value1 < this.minDif) {
                newValue = this.value1 + this.minDif;
            }
            if (newValue - this.value1 > this.maxDif) {
                newValue = this.value1 + this.maxDif;
            }
            this.value2 = newValue;
        }

        this.setAttribute('value1', this.value1);
        this.setAttribute('value2', this.value2);

        this.setInitialThumbPositions();
    }

    showValueDisplay(display) {
        display.style.opacity = 1;
    }

    hideValueDisplay(display) {
        display.style.opacity = 0;
    }

    showValueDisplays() {
        this.showValueDisplay(this.valueDisplay1);
        this.showValueDisplay(this.valueDisplay2);
    }

    hideValueDisplays() {
        this.hideValueDisplay(this.valueDisplay1);
        this.hideValueDisplay(this.valueDisplay2);
    }

    updateValueDisplays() {
        this.updateDisplayPosition(this.thumb1, this.valueDisplay1);
        this.updateDisplayPosition(this.thumb2, this.valueDisplay2);
        this.valueDisplay1.textContent = this.value1;
        this.valueDisplay2.textContent = this.value2;
    }

    updateDisplayPosition(thumb, valueDisplay) {
        const thumbRect = thumb.getBoundingClientRect();
        const trackRect = this.track.getBoundingClientRect();
        const valueRect = valueDisplay.getBoundingClientRect();

        if (this.expose === 'top') {
            valueDisplay.style.left = `${thumbRect.left - trackRect.left - 4}px`;
            valueDisplay.style.top = `${thumbRect.top - trackRect.top - valueRect.height - 8}px`;
        } else if (this.expose === 'bottom') {
            valueDisplay.style.left = `${thumbRect.left - trackRect.left - 4}px`;
            valueDisplay.style.top = `${thumbRect.top - trackRect.top + thumbRect.height + 8}px`;
        }
    }
} customElements.define('unicorn-split-range', UnicornSplitRange);

// SELECT INPUT
// Example: <unicorn-select title="Vegetables" options="Potato, Tomato, Cucumber, Carrot" value="Select Option"></unicorn-select>
class UnicornSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }
                :host * {
                    font-family: Arial, Helvetica, sans-serif;
                    font-weight: 200;
                    scrollbar-width: 0;
                }
                ::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                }

                .title {
                    margin: 0;
                    opacity: 0.7;
                    width: 80px;
                }

                .unicorn-select-container {
                    position: relative;
                    width: calc(100% - 80px);
                    max-width: 280px;
                }

                .unicorn-select-button {
                    color: var(--font2);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 11px 14px;
                    width: calc(100% - 28px);
                    background-color: var(--back1);
                    cursor: pointer;
                    border-radius: 8px;
                }

                .unicorn-select-button:hover {
                    outline: 1px solid var(--transSecondary);
                }

                .unicorn-select-button:focus {
                    outline: 1px solid var(--secondary);
                }

                .unicorn-select-label {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    flex-shrink: 1;
                }

                .dropdown-svg {
                    fill: var(--primary);
                    width: 16px;
                    height: 16px;
                    transition: transform 0.2s;
                }

                .open .dropdown-svg {
                    transform: rotate(180deg);
                }

                .unicorn-select-options {
                    display: none;
                    position: absolute;
                    top: calc(100% + 2px);
                    left: -1px;
                    width: 100%;
                    background-color: var(--back2);
                    border: 1px solid var(--back4);
                    border-radius: 8px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 10;

                    scrollbar-width: none;
                }

                .unicorn-select-option {
                    color: var(--font2);
                    padding: 11px 14px;
                    cursor: pointer;
                    transition: background-color 0.1s;
                    border-bottom: 1px solid var(--back3);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .unicorn-select-option:last-of-type {
                    border-bottom: none;
                }

                .unicorn-select-option:hover {
                    color: var(--back1);
                    background-color: #ddeeff;
                }

                /* Style for selected option */
                .unicorn-select-option.selected {
                    color: var(--primary);
                    background-color: var(--back1);
                    cursor: default;
                    pointer-events: none;
                }

                .unicorn-select-container.open .unicorn-select-options {
                    display: block;
                }
            </style>
            <h4 class="title"></h4>
            <div class="unicorn-select-container">
                <div class="unicorn-select-button" tabindex="0">
                    <span class="unicorn-select-label"></span>
                    <svg class="dropdown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                </div>
                <div class="unicorn-select-options"></div>
            </div>
        `;

        this.titleElement = this.shadowRoot.querySelector('.title');
        this.container = this.shadowRoot.querySelector('.unicorn-select-container');
        this.button = this.shadowRoot.querySelector('.unicorn-select-button');
        this.label = this.shadowRoot.querySelector('.unicorn-select-label');
        this.optionsList = this.shadowRoot.querySelector('.unicorn-select-options');
        this.selectedValue = this.getAttribute('value') || '';
        this.options = this.getAttribute('options') ? this.getAttribute('options').split(',').map(opt => opt.trim()) : [];
        this.title = this.getAttribute('title') || '';

        this._isRendering = false; // Flag to prevent recursion

        this.attachEventListeners();
        this.renderOptions();
        this.updateButtonLabel();
        this.updateTitle();
    }

    static get observedAttributes() {
        return ['value', 'options', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Prevent recursion using a flag
        if (this._isRendering) return;

        this._isRendering = true;

        if (name === 'options') {
            this.options = newValue.split(',').map(opt => opt.trim());
            this.renderOptions();
        }
        if (name === 'value') {
            this.selectedValue = newValue;
            this.updateButtonLabel();
            this.renderOptions(); // Re-render options to apply selected style
        }
        if (name === 'title') {
            this.title = newValue;
            this.updateTitle();
        }

        this._isRendering = false;
    }

    attachEventListeners() {
        this.button.addEventListener('mousedown', (e) => {
            this.container.classList.toggle('open');
            if (this.container.classList.contains('open')) {
                this.button.focus();
            } else {
                this.button.blur();
            }
            e.preventDefault(); // Prevent losing focus on mousedown
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.contains(e.target)) {
                this.container.classList.remove('open');
                this.button.blur(); // Remove focus when clicking outside
            }
        });

        this.optionsList.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('unicorn-select-option')) {
                this.selectedValue = e.target.textContent;
                this.setAttribute('value', this.selectedValue);
                this.updateButtonLabel();
                this.container.classList.remove('open');
                this.button.blur(); // Blur when an option is selected
            }
        });
    }

    renderOptions() {
        if (this._isRendering) return; // Prevent recursion
        this._isRendering = true;

        this.optionsList.innerHTML = '';
        this.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('unicorn-select-option');
            optionElement.textContent = option;

            optionElement.addEventListener('mousedown', (e) => {
                this.optionsList.querySelectorAll('.unicorn-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElement.classList.add('selected');
            });

            this.optionsList.appendChild(optionElement);
        });

        this._isRendering = false;
    }

    updateButtonLabel() {
        this.label.textContent = this.selectedValue || 'Select an option';
    }

    updateTitle() {
        this.titleElement.textContent = this.title;
    }

    setOptions(newOptions) {
        this.options = newOptions;
        this.renderOptions();
    }
} customElements.define('unicorn-select', UnicornSelect);

// RANGE FLOAT INPUT
// Example: <unicorn-float-range title="Length"  min="60" max="300" step="1" value="100" unit="cm"></unicorn-float-range>
class UnicornFloatRange extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    width: auto;
                }
                :host * {
                    font-family: Arial, Helvetica, sans-serif;
                    font-weight: 200;
                }

                .title {
                    margin: 0;
                    opacity: 0.7;
                }

                .container {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .unicorn-range-container {
                    flex: 1;
                    margin-right: 16px;
                }

                .unicorn-range-track {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    height: 4px;
                    min-width: 60px;
                    border-radius: 100px;
                    background-image: linear-gradient(to right, var(--primary) 0%, var(--back1) 0%);
                    margin: 0px 3px;
                }

                .unicorn-range-thumb {
                    position: absolute;
                    top: 50%;
                    width: 10px;
                    height: 18px;
                    background-color: var(--font2);
                    outline: 0px solid var(--transSecondary);
                    border-radius: 3px;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    transition: outline 0.1s;
                }

                .unicorn-range-thumb:hover, .unicorn-range-thumb.focus {
                    outline: 4px solid var(--transSecondary);
                }

                .unicorn-float-input-container {
                    display: flex;
                    flex-shrink: 0;
                    align-items: center;
                    height: 32px;
                    width: 93px;
                    border-radius: 6px;
                    overflow: hidden;
                    background-color: var(--back1);
                    margin-left: 10px;
                }

                .unicorn-float-input-container:hover {
                    outline: 1px solid var(--transSecondary);
                }

                .unicorn-float-input-container:focus-within {
                    outline: 1px solid var(--secondary);
                }

                .unicorn-float-textarea {
                    color: var(--font2);
                    width: calc(100% - 40px);
                    height: 100%;
                    font-size: 16px;
                    text-align: left;
                    padding: 0px 0px 0px 8px;
                    border: none;
                    outline: none;
                    resize: none;
                    overflow: hidden;
                    white-space: nowrap;
                    line-height: 32px;
                    background-color: var(--back1);
                }

                .unicorn-float-unit {
                    color: #888;
                    padding: 0px 8px 0px 0px;
                    background-color: var(--back1);
                    margin: 0;
                    user-select: none;
                    pointer-events: none;
                }

                .unicorn-float-buttons {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-evenly;
                    height: 100%;
                    border-left: 1px solid var(--back4);
                }

                .unicorn-float-input-button {
                    width: 22px;
                    height: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .unicorn-float-input-button:hover {
                    background-color: #4488dd33;
                }

                .unicorn-float-input-button svg {
                    fill: var(--primary);
                    width: 13px;
                    height: 13px;
                }
            </style>
            <h4 class="title"></h4>
            <div class="container">
                <div class="unicorn-range-container">
                    <div class="unicorn-range-track">
                        <div class="unicorn-range-thumb"></div>
                    </div>
                </div>
                <div class="unicorn-float-input-container">
                    <textarea class="unicorn-float-textarea" id="value"></textarea>
                    <p class="unicorn-float-unit"></p>
                    <div class="unicorn-float-buttons">
                        <div class="unicorn-float-input-button up" id="increase" tabindex="0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/>
                            </svg>
                        </div>
                        <div class="unicorn-float-input-button down" id="decrease" tabindex="0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.titleElement = this.shadowRoot.querySelector('.title');
        this.rangeContainer = this.shadowRoot.querySelector('.unicorn-range-container');
        this.rangeTrack = this.shadowRoot.querySelector('.unicorn-range-track');
        this.rangeThumb = this.shadowRoot.querySelector('.unicorn-range-thumb');
        this.floatInputContainer = this.shadowRoot.querySelector('.unicorn-float-input-container');
        this.textarea = this.shadowRoot.querySelector('#value');
        this.increaseButton = this.shadowRoot.querySelector('#increase');
        this.decreaseButton = this.shadowRoot.querySelector('#decrease');
        this.unitElement = this.shadowRoot.querySelector('.unicorn-float-unit');

        this.isDragging = false;
        this.debounceTimeout = null;
    }

    connectedCallback() {
        this.attachEventListeners();
        this.updateAttributes();
        this.setInitialValues();
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'value', 'unit', 'title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.updateAttributes();
        }
    }

    cacheDOMElements() {
        const elements = ['.title', '.unicorn-range-container', '.unicorn-range-track', 
                            '.unicorn-range-thumb', '.unicorn-float-input-container', 
                            '#value', '#increase', '#decrease', '.unicorn-float-unit'];
        
        [this.titleElement, this.rangeContainer, this.rangeTrack, this.rangeThumb, 
            this.floatInputContainer, this.textarea, this.increaseButton, 
            this.decreaseButton, this.unitElement] = elements.map(selector => 
            this.shadowRoot.querySelector(selector)
        );
    }

    updateAttributes() {
        const attrs = ['min', 'max', 'step', 'value', 'unit', 'title'];
        const [min, max, step, value, unit, title] = attrs.map(attr => 
            this.getAttribute(attr) || ''
        );

        this.setRangeAttributes(min, max, step, value);
        this.unitElement.textContent = unit.toLowerCase() === 'none' ? '' : unit;
        this.titleElement.textContent = title;
        this.syncDisplay();
    }

    setRangeAttributes(min, max, step, value) {
        [this.rangeContainer, this.textarea].forEach(element => {
            ['min', 'max', 'step', 'value'].forEach(attr => 
                element.setAttribute(attr, this.getAttribute(attr))
            );
        });
    }

    syncDisplay() {
        const value = parseFloat(this.getAttribute('value'));
        this.textarea.value = this.roundToStep(value, parseFloat(this.getAttribute('step')));
        this.updateRangePosition();
    }

    setInitialValues() {
        this.syncDisplay();
    }

    roundToStep(value, step) {
        const factor = 1 / step;
        return Math.round(value * factor) / factor;
    }

    updateRangePosition() {
        const [min, max, value] = ['min', 'max', 'value'].map(attr => parseFloat(this.getAttribute(attr)));
        const percentage = ((value - min) / (max - min)) * 100;
        this.rangeThumb.style.left = `${percentage}%`;
        this.rangeTrack.style.backgroundImage = `linear-gradient(to right, var(--primary) ${percentage}%, var(--back1) ${percentage}%)`;
    }

    debounce(func, delay) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(func, delay);
    }

    attachEventListeners() {
        const events = [
            { el: this.rangeThumb, type: 'mousedown', handler: (e) => this.startDrag(e) },
            { el: document, type: 'mouseup', handler: () => this.stopDrag() },
            { el: document, type: 'mousemove', handler: (e) => this.isDragging && this.updateSlider(e.clientX) },
            { el: this.rangeTrack, type: 'mousedown', handler: (e) => { this.handleTrackClick(e); this.startDrag(e); }},
            { el: this.textarea, type: 'click', handler: () => this.textarea.select() }
        ];

        events.forEach(event => event.el.addEventListener(event.type, event.handler));

        // Debounced input handling
        this.textarea.addEventListener('input', () => this.debounce(() => this.handleTextInput(), 600)); // Adjust the delay as needed
        
        // Button listeners
        this.addHoldButtonListener(this.increaseButton, parseFloat(this.getAttribute('step')) || 1);
        this.addHoldButtonListener(this.decreaseButton, -(parseFloat(this.getAttribute('step')) || 1));
    }

    handleTextInput() {
        const value = this.textarea.value.trim(); // Trim any whitespace
        const [min, max, step] = ['min', 'max', 'step'].map(attr => parseFloat(this.getAttribute(attr)));
    
        if (value === '') {
            // Handle empty input as min value
            const clampedValue = min;
            this.setAttribute('value', clampedValue);
            this.textarea.value = clampedValue;
            this.updateRangePosition();
        } else {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
                const roundedValue = this.roundToStep(parsedValue, step);
                const clampedValue = Math.max(min, Math.min(roundedValue, max));
                this.setAttribute('value', clampedValue);
                this.textarea.value = clampedValue;
                this.updateRangePosition();
            }
        }
    }

    startDrag(event) {
        this.isDragging = true;
        this.rangeThumb.classList.add('focus');
        this.updateSlider(event.clientX);
    }

    stopDrag() {
        this.isDragging = false;
        this.rangeThumb.classList.remove('focus');
    }

    updateSlider(mouseX) {
        const trackRect = this.rangeTrack.getBoundingClientRect();
        const percentage = Math.min(100, Math.max(0, ((mouseX - trackRect.left) / trackRect.width) * 100));
        const [min, max, step] = ['min', 'max', 'step'].map(attr => parseFloat(this.getAttribute(attr)));
        const newValue = this.roundToStep((percentage / 100) * (max - min) + min, step);
        this.setAttribute('value', newValue);
        this.textarea.value = newValue;
        this.updateRangePosition();
    }

    handleTrackClick(event) {
        this.updateSlider(event.clientX);
    }

    addHoldButtonListener(button, delta) {
        let timer;
        let rapidChangeInterval;
    
        const startChange = () => {
            this.changeValue(delta);  // First change on button down
            timer = setTimeout(() => {
                rapidChangeInterval = setInterval(() => {
                    this.changeValue(delta);  // Continuous change during hold
                }, 50);  // 20 changes per second
            }, 500);  // Start rapid change after 500ms hold
        };
    
        const stopChange = () => {
            clearTimeout(timer);  // Stop the initial hold delay
            clearInterval(rapidChangeInterval);  // Stop the rapid changes
        };
    
        // Mouse events
        button.addEventListener('mousedown', startChange);
        document.addEventListener('mouseup', stopChange);
        button.addEventListener('mouseleave', stopChange);
    
        // Touch events
        button.addEventListener('touchstart', startChange);
        document.addEventListener('touchend', stopChange);
        document.addEventListener('touchcancel', stopChange);
    }

    changeValue(delta) {
        const currentValue = parseFloat(this.getAttribute('value')) || 0;
        const [min, max, step] = ['min', 'max', 'step'].map(attr => parseFloat(this.getAttribute(attr)));
        const newValue = this.roundToStep(currentValue + delta, step);
        const clampedValue = Math.max(min, Math.min(newValue, max));
        this.setAttribute('value', clampedValue);
        this.textarea.value = clampedValue;
        this.updateRangePosition();
    }
} customElements.define('unicorn-float-range', UnicornFloatRange);

// SELECT RANGE FLOAT INPUT
// Example: <unicorn-select-expand title="Gravity" min="-2" max="2" step="0.1" value="0.7" unit="lb" options="Potato, Tomato, Cucumber, Carrot"></unicorn-select-expand>
class UnicornSelectExpand extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }
                :host * {
                    font-family: Arial, Helvetica, sans-serif;
                    font-weight: 200;
                    scrollbar-width: 0;
                }
                ::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                }

                .title {
                    margin: 0;
                    opacity: 0.7;
                    width: 80px;
                }

                .unicorn-select-container {
                    position: relative;
                    width: calc(100% - 80px);
                    max-width: 280px;
                }

                .unicorn-select-button {
                    color: var(--font2);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 11px 14px;
                    width: calc(100% - 28px);
                    background-color: var(--back1);
                    cursor: pointer;
                    border-radius: 8px;
                }

                .unicorn-select-button:hover {
                    outline: 1px solid var(--transSecondary);
                }

                .unicorn-select-button:focus {
                    outline: 1px solid var(--secondary);
                }

                .unicorn-select-label {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    flex-shrink: 1;
                }

                .dropdown-svg {
                    fill: var(--primary);
                    width: 16px;
                    height: 16px;
                    transition: transform 0.2s;
                }

                .open .dropdown-svg {
                    transform: rotate(180deg);
                }

                .unicorn-select-options {
                    display: none;
                    position: absolute;
                    top: calc(100% + 2px);
                    left: -1px;
                    width: 100%;
                    background-color: var(--back2);
                    border: 1px solid var(--back4);
                    border-radius: 8px;
                    max-height: 300px;
                    overflow-y: auto;
                    z-index: 10;

                    scrollbar-width: none;
                }

                .unicorn-select-container.open .unicorn-select-options {
                    display: block;
                }

                .unicorn-select-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    color: var(--font2);
                    padding: 11px 14px;
                    cursor: pointer;
                    transition: background-color 0.1s;
                    border-bottom: 1px solid var(--back3);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .unicorn-select-option:last-of-type {
                    border-bottom: none;
                }

                .unicorn-select-option:hover {
                    color: var(--back1);
                    background-color: #ddeeff;
                }

                .unicorn-select-option.selected {
                    color: var(--primary);
                    background-color: var(--back1);
                }

                .delete-button {
                    position: absolute; /* Position the delete button on top */
                    right: 10px; /* Ensure it stays on the right side */
                    z-index: 2; /* Higher than the surrounding text */
                    width: 24px;
                    height: 24px;
                    background-color: var(--back3);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    margin-left: 10px;
                    flex-shrink: 0;
                }

                .delete-button:hover {
                    background-color: #ff4444;
                }

                .delete-button svg {
                    position: absolute;
                    fill: #ffffff;
                    width: 14px;
                    height: 14px;
                }
            </style>
            <h4 class="title"></h4>
            <div class="unicorn-select-container">
                <div class="unicorn-select-button" tabindex="0">
                    <span class="unicorn-select-label"></span>
                    <svg class="dropdown-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                </div>
                <div class="unicorn-select-options"></div>
            </div>
        `;

        this.titleElement = this.shadowRoot.querySelector('.title');
        this.container = this.shadowRoot.querySelector('.unicorn-select-container');
        this.button = this.shadowRoot.querySelector('.unicorn-select-button');
        this.label = this.shadowRoot.querySelector('.unicorn-select-label');
        this.optionsList = this.shadowRoot.querySelector('.unicorn-select-options');

        this._isRendering = false; // Flag to prevent recursion
        this.selectedValue = this.getAttribute('value') || '';
        this.options = this.getAttribute('options') ? this.getAttribute('options').split(',').map(opt => opt.trim()) : [];
        this.title = this.getAttribute('title') || '';

        this.attachEventListeners();
        this.renderOptions();
        this.updateButtonLabel();
        this.updateTitle();
    }

    // New method to set options
    setOptions(options) {
        this.options = options;
        this.renderOptions();
    }

    static get observedAttributes() {
        return ['value', 'options', 'title', 'min', 'max', 'step', 'unit'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this._isRendering) return; // Prevent recursion

        this._isRendering = true;

        if (name === 'options') {
            this.options = newValue.split(',').map(opt => opt.trim());
            this.renderOptions();
        }
        if (name === 'value') {
            this.selectedValue = newValue;
            this.updateButtonLabel();
            this.renderOptions(); // Re-render options to apply selected style
        }
        if (name === 'title') {
            this.title = newValue;
            this.updateTitle();
        }

        this._isRendering = false;
    }

    attachEventListeners() {
        this.button.addEventListener('mousedown', (e) => {
            this.container.classList.toggle('open');
            if (this.container.classList.contains('open')) {
                this.button.focus();
            } else {
                this.button.blur();
            }
            e.preventDefault(); // Prevent losing focus on mousedown
        });
    
        document.addEventListener('mousedown', (e) => {
            if (!this.contains(e.target)) {
                this.container.classList.remove('open');
                this.button.blur(); // Remove focus when clicking outside
            }
        });
    
        this.optionsList.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('unicorn-select-option')) {
                const optionValue = e.target.dataset.value || e.target.textContent;
                this.createUnicornRangeSlider(optionValue);
                this.container.classList.remove('open');
                this.container.classList.remove('selected');
            }
        });
    }

    renderOptions() {
        if (this._isRendering) return; // Prevent recursion
        this._isRendering = true;

        this.optionsList.innerHTML = '';

        this.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('unicorn-select-option');
            optionElement.textContent = option;

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/></svg>'; 
            deleteButton.classList.add('delete-button');

            const sliderId = option.replace(/\s+/g, '-');

            const sliderExists = !!this.parentNode.querySelector(`#${sliderId}`);

            if (sliderExists) {
                optionElement.classList.add('selected');
                optionElement.appendChild(deleteButton);
                deleteButton.dataset.sliderId = sliderId;

                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.removeSlider(deleteButton.dataset.sliderId);
                });
            }

            this.optionsList.appendChild(optionElement);
        });

        this._isRendering = false;
    }

    removeSlider(sliderId) {
        const slider = this.parentNode.querySelector(`#${sliderId}`);
        if (slider) {
            slider.remove();
            console.log(`Slider with ID ${sliderId} removed.`);

            this.renderOptions(); // Ensure delete button is updated
        }
    }

    updateButtonLabel() {
        this.label.textContent = 'Select Options';
    }

    updateTitle() {
        this.titleElement.textContent = this.title;
    }

    createUnicornRangeSlider(id) {
        const sanitizedId = id.replace(/\s+/g, '-');
        const parentContainer = this.parentNode;

        if (!parentContainer) {
            console.error('Parent container not found.');
            return;
        }

        const existingSlider = parentContainer.querySelector(`#${sanitizedId}`);
        if (existingSlider) {
            console.log(`Slider with ID ${sanitizedId} already exists.`);
            return;
        }

        const slider = document.createElement('unicorn-float-range');
        slider.id = sanitizedId;
        slider.setAttribute('min', this.getAttribute('min'));
        slider.setAttribute('max', this.getAttribute('max'));
        slider.setAttribute('step', this.getAttribute('step'));
        slider.setAttribute('value', this.getAttribute('value'));
        slider.setAttribute('unit', this.getAttribute('unit') || '');
        slider.setAttribute('title', id);

        parentContainer.appendChild(slider);
        console.log('New slider added:', slider);

        this.renderOptions();
    }
} customElements.define('unicorn-select-expand', UnicornSelectExpand);