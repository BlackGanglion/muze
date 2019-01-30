import {
    ERROR_MSG,
    mergeRecursive,
    getSmartComputedStyle,
    selectElement,
    generateGetterSetters,
    getUniqueId
} from 'muze-utils';
import { createScale } from '../scale-creator';
import { axisOrientationMap } from '../enums/axis-orientation';
import { defaultConfig } from '../cartesian-axis/default-config';
import { renderAxis } from '../axis-renderer';
import { TOP, BOTTOM } from '../enums/constants';
import { spaceSetter } from './space-setter';
import {
    getAxisComponentDimensions,
    computeAxisDimensions,
    getValidDomain
} from './common-helper';
import { PROPS } from './props';

export default class SimpleAxis {

    /**
     * Creates an instance of SimpleAxis.
     * @memberof SimpleAxis
     */
    constructor (config, dependencies) {
        this._id = getUniqueId();

        this._dependencies = dependencies;
        this._mount = null;
        this._range = [];
        this._domain = [];
        this._domainLock = false;
        this._axisDimensions = {};
        this._smartTicks = [];

        const defCon = mergeRecursive({}, this.constructor.defaultConfig());
        const simpleConfig = mergeRecursive(defCon, config);

        const bodyElem = selectElement('body');
        const classPrefix = simpleConfig.classPrefix;
        this._tickLabelStyle = getSmartComputedStyle(bodyElem, `${classPrefix}-ticks`);
        this._axisNameStyle = getSmartComputedStyle(bodyElem, `${classPrefix}-axis-name`);

        dependencies.labelManager.setStyle(this._tickLabelStyle);
        const dist = dependencies.labelManager.getOriSize('w');

        this._minTickDistance = { width: dist.width * 3 / 4, height: dist.height / 2 };
        this._minTickSpace = dependencies.labelManager.getOriSize('www');

        generateGetterSetters(this, PROPS);
        this.config(simpleConfig);

        this._scale = this.createScale(this._config);
        this._axis = this.createAxis(this._config);
        this._animationDonePromises = [];
    }

    /**
     * Returns the default configuration of simple axis
     *  @return {Object} default configurations
     */
    static defaultConfig () {
        return defaultConfig;
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    createScale (config) {
        const {
            base,
            padding,
            interpolator,
            exponent
        } = config;
        const range = this.range();
        const scale = createScale({
            padding,
            interpolator,
            exponent,
            base,
            range,
            type: this.constructor.type()
        });

        return scale;
    }

    setRotationConfig () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    getTickValues () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

     /**
     * This method is used to set the space availiable to render
     * the SimpleCell.
     *
     * @param {number} width The width of SimpleCell.
     * @param {number} height The height of SimpleCell.
     * @memberof AxisCell
     */
    setAvailableSpace (width = 0, height, padding, isOffset) {
        let labelConfig = {};
        const {
           orientation
       } = this.config();
        const axisType = this.constructor.type();
        this.availableSpace({ width, height, padding });

        if (orientation === TOP || orientation === BOTTOM) {
            labelConfig = spaceSetter(this, { isOffset })[axisType].x();
        } else {
            labelConfig = spaceSetter(this, { isOffset })[axisType].y();
        }

        // Set config
        this.renderConfig({
            labels: labelConfig
        });

        this.setTickConfig();

        return this;
    }

    getLogicalSpace () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    setTickConfig () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    getTickSize () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    getMinTickDifference () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    dependencies () {
        return this._dependencies;
    }

    domain (...domain) {
        if (domain.length) {
            let domainValue = domain[0];
            domainValue = getValidDomain(this, domainValue);
            this.scale().domain(domainValue);
            this._domain = this.scale().domain();
            this.setAxisComponentDimensions();
            this.logicalSpace(null);
            return this;
        }
        return this._domain;
    }

    resetDomain () {
        this._domain = [];
        return this;
    }

    setAxisComponentDimensions () {
        this.axisComponentDimensions(getAxisComponentDimensions(this));
    }

    getTickFormatter (value) {
        const { tickFormat, numberFormat } = value;

        if (tickFormat) {
            return ticks => (val, i) => tickFormat(numberFormat(val), val, i, ticks);
        }
        return () => val => numberFormat(val);
    }

    resetLogicalSpace () {
        this.logicalSpace(null);
        this.range([]);
        const {
            labels,
            show,
            showInnerTicks,
            showOuterTicks,
            showAxisName
        } = this.config();
        this.renderConfig({
            labels,
            show,
            showInnerTicks,
            showOuterTicks,
            showAxisName
        });
    }

    getFormattedText (text, index, axisTicks) {
        const formatter = this._tickFormatter;

        return formatter(axisTicks)(text, index);
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    createAxis (config) {
        const { orientation } = config;
        const axisClass = axisOrientationMap[orientation];

        if (axisClass) {
            const axis = axisClass(this.scale());
            return axis;
        }
        return null;
    }

    getScaleValue (domainVal) {
        if (domainVal === null || domainVal === undefined) {
            return undefined;
        }
        return this.scale()(domainVal);
    }

    /**
     * Gets the space occupied by the parts of an axis
     *
     * @return {Object} object with details about sizes of the axis.
     * @memberof SimpleAxis
     */
    getAxisDimensions (...params) {
        this.axisDimensions(computeAxisDimensions(this, ...params));
        return this.axisDimensions();
    }

    /**
     * Returns the value from the domain when given a value from the range.
     * @param {number} value Value from the range.
     * @return {number} Value
     */
    invert (...value) {
        const values = value.map(d => this.scale().invert(d)) || [];
        return value.length === 1 ? values[0] : values;
    }

    /**
     * Gets the nearest range value from the given range values.
     * @param {number} v1 Start range value
     * @param {number} v2 End range value
     * @return {Array} range values
     */
    getNearestRange (v1, v2) {
        return [v1, v2];
    }

    getFormattedTickValues (tickValues) {
        return tickValues;
    }

    /**
     * This method returns the width in pixels for one
     * unit along the axis. It is only applicable to band scale
     * and returns undefined for other scale type.
     *
     * @return {number} the width of one band along band scale axis
     * @memberof SimpleAxis
     */
    getUnitWidth () {
        return 0;
    }

    /**
     * Returns the id of the axis.
     * @return {string} Unique identifier of the axis.
     */
    get id () {
        return this._id;
    }

    /**
     * This method is used to render the axis inside
     * the supplied svg container.
     *
     * @param {SVGElement} svg the svg element in which to render the path
     * @memberof SimpleAxis
     */
    render () {
        if (this.mount()) {
            this.setTickConfig();
            renderAxis(this);
        }
        return this;
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    remove () {
        selectElement(this.mount()).remove();
        return this;
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    isReverse () {
        const range = this.range();
        return range[0] > range[1];
    }

    /**
     *
     *
     *
     * @memberof SimpleAxis
     */
    getPixelToValueRatio () {
        const scale = this.scale();
        const range = scale.range();
        const domain = scale.domain();

        return Math.abs(range[1] - range[0]) / (domain[1] - domain[0]);
    }

     /**
     * Notifies when all animations/transitions of the axis are completed.
     *
     * @public
     * @return {Promise} Returns a promise to notify the animation completion.
     */
    animationDone () {
        return Promise.all(this._animationDonePromises);
    }

    registerAnimationDoneHook () {
        let resolveFn;
        const promise = new Promise((resolve) => {
            resolveFn = resolve;
        });
        this._animationDonePromises.push(promise);

        return () => {
            resolveFn();
        };
    }
}

