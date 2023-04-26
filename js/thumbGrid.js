export class ThumbGrid {
    DOM = {
        el : null,
        items: null
    }
    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        this.DOM.items = this.DOM.el.querySelectorAll('.thumbgrid__item');

        gsap.set(this.DOM.items, {willChange: 'transform, opacity'});
    }
}