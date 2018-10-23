import { selectElement } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import { TOP, LEFT, BOTTOM } from '../../constants';

export default class HeaderComponent extends MuzeComponent {
    /**
     *
     * @param {*} params
     * {
     * name : 'title'
     * component: title | null
     * config : {
     *  height :
     *  width :
     *  .....
     *  }
     * }
     */
    constructor (params) {
        super(params.name, params.component.getLogicalSpace(), 0);
        this.component = params.component;
        this.params = params;
        this.target = params.config.target;
        this.position = params.config.position;
    }

    renderHeader (container) {
        const layoutConfig = this.params.config;
        container = selectElement(container);
        const { position, align, padding } = layoutConfig;
        const sel = container
          .selectAll(`.${layoutConfig.classPrefix}-inner-container`)
          .data([this.name]);
        sel.exit().remove();
        const selEnter = sel.enter().append('div');

        const cont = selEnter.merge(sel);
        cont.classed(`${layoutConfig.classPrefix}-inner-container`, true);

        this.component && this.component.render(cont.node());

        cont.selectAll('div').classed(`${layoutConfig.classPrefix}-inner-content`, true);
        cont.style('width', `${100}%`);

        if (layoutConfig && this.component) {
            cont.style('float', LEFT)
                            .style('text-align', align)
                            .style(`padding-${position === TOP ? BOTTOM : TOP}`, `${padding}px`);
        }
    }

    draw (container) {
        this.renderHeader(container || this.renderAt);
    }

}