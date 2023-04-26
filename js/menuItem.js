import { wrapElements } from './utils.js';

export class MenuItem {
    DOM = {
        el : null,
        title: null,
    }
    thumbGrid;
    contentItem;
    titleChars;

    constructor(DOM_el, thumbGrid, contentItem) {
        this.DOM.el = DOM_el;
        this.thumbGrid = thumbGrid;
        this.contentItem = contentItem;

        this.DOM.title = this.DOM.el.querySelector('.menu__item-title');
        this.DOM.description = this.DOM.el.querySelector('.menu__item-desc');

        // Apply the Splitting js to the title
        this.DOM.title.dataset.splitting = '';
        Splitting();

        // title characters
        this.DOM.titleChars = this.DOM.title.querySelectorAll('.char');
        wrapElements(this.DOM.titleChars, 'span', 'char-wrap');

        gsap.set([this.DOM.title, this.DOM.description, this.DOM.titleChars], {willChange: 'transform, opacity'});
    }
}