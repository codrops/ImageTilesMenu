import { ThumbGrid } from './thumbGrid.js';
import { ContentItem } from './contentItem.js';
import { MenuItem } from './menuItem.js';
import { preloadImages } from './utils.js';

// Thumbs grid items
let thumbGrids = [];
[...document.querySelectorAll('.thumbgrid-wrap > .thumbgrid')].forEach(thumbGrid => {
    thumbGrids.push(new ThumbGrid(thumbGrid));
});

// Content items
let contentItems = [];
[...document.querySelectorAll('.content-wrap > .content')].forEach(contentItem => {
    contentItems.push(new ContentItem(contentItem));
});

// Menu items
const menu = document.querySelector('.menu');
let menuItems = [];
[...menu.querySelectorAll('.menu__item')].forEach((menuItem, position) => {
    menuItems.push(new MenuItem(menuItem, thumbGrids[position], contentItems[position]));
});

// menu || content
let mode = 'menu';
// Check if the animation is in progress
let isAnimating = false;

for (const menuItem of menuItems) {
    
    // Mouseenter/Mouseleave events: show thumbs / Hide thumbs
    menuItem.DOM.el.addEventListener('mouseenter', () => {
        // Clear previous timeout to avoid unwanted triggers
        clearTimeout(menuItem.mouseEnterTimeout); 
        
        if ( menuItem.leaveTL ) {
            menuItem.leaveTL.kill();
        }

        if ( mode === 'content' ) return;

        menuItem.mouseEnterTimeout = setTimeout(() => {
            menuItem.thumbGrid.DOM.el.classList.add('thumbgrid--current');

            menuItem.enterTL = gsap
            .timeline({
                defaults: {
                    duration: 0.5,
                    ease: 'expo'
                }
            })
            .addLabel('start', 0)
            .to(menuItem.DOM.title, {
                x: 0
            }, 'start')
            .fromTo(menuItem.DOM.description, {
                opacity: 0,
                yPercent: 50,
            }, {
                opacity: 1,
                yPercent: 0,
            }, 'start')
            .fromTo(menuItem.thumbGrid.DOM.items, {
                opacity: 0,
                scale: 0.5
            }, {
                stagger: 0.045,
                opacity: 1,
                scale: 1
            }, 'start')
        }, 20);
    });

    menuItem.DOM.el.addEventListener('mouseleave', () => {
        // Clear the timeout to avoid triggering the event after leaving the element
        clearTimeout(menuItem.mouseEnterTimeout);
        clearTimeout(menuItem.mouseLeaveTimeout);

        if ( menuItem.enterTL ) {
            menuItem.enterTL.kill();
        }

        if ( mode === 'content' ) return;

        menuItem.mouseLeaveTimeout = setTimeout(() => {
            menuItem.thumbGrid.DOM.el.classList.remove('thumbgrid--current');
            
            menuItem.leaveTL = gsap
            .timeline({
                defaults: {
                    duration: 0.3,
                    ease: 'power3'
                }
            })
            .addLabel('start', 0)
            .to(menuItem.DOM.title, {
                x: 50
            }, 'start')
            .to(menuItem.DOM.description, {
                opacity: 0,
                yPercent: 20
            }, 'start')
            .to(menuItem.thumbGrid.DOM.items, {
                opacity: 0,
                scale: 0.5,
            }, 'start')
        }, 20)
    });

    // Click event: show content area
    menuItem.DOM.el.addEventListener('click', () => {
        if ( isAnimating ) return;
        
        isAnimating = true;
        mode = 'content';

        const DURATION = 0.75;
        const EASE = 'expo';
        const THUMBDELAY = '0.02';

        // Clear the timeout to avoid triggering the event after leaving the element
        clearTimeout(menuItem.mouseEnterTimeout);
        clearTimeout(menuItem.mouseLeaveTimeout);
        
        if ( menuItem.enterTL ) {
            menuItem.enterTL.kill();
        }
        if ( menuItem.leaveTL ) {
            menuItem.leaveTL.kill();
        }
        
        gsap
        .timeline({
            defaults: {
                duration: DURATION,
                ease: EASE
            },
            onStart: () => {
                menuItem.contentItem.DOM.el.classList.add('content--current');
            },
            onComplete: () => {
                // Reset values from last hover state

                gsap.set(menuItem.DOM.title, {
                    x: 50
                });
                menuItem.thumbGrid.DOM.el.classList.remove('thumbgrid--current');

                isAnimating = false;
            }
        })
        .addLabel('menu', 0)
        .to(menuItem.DOM.titleChars, {
            ease: 'power4.inOut',
            //stagger: 0.015,
            xPercent: -100
        }, 'menu')
        .to(menuItem.DOM.description, {
            ease: 'power4.inOut',
            yPercent: -60,
            opacity: 0
        }, 'menu')
        .add(() => {
            const flipstate = Flip.getState(menuItem.thumbGrid.DOM.items, {props: "transform,opacity"});
            
            if ( menuItem.enterTL ) {
                menuItem.enterTL.progress(1, false);
            }
            
            [...menuItem.thumbGrid.DOM.items].forEach(item => {
                menuItem.contentItem.DOM.thumbgrid.appendChild(item);
            });
            
            Flip.from(flipstate, {
                duration: DURATION,
                ease: 'power4.inOut',
                scale: true,
                simple: true,
                prune: true,
                stagger: {
                    each: THUMBDELAY,
                    from: 'end'
                }
            })
            .add(() => {
                // Show one image rather than the four together
                menuItem.contentItem.DOM.thumbgrid.classList.add('thumbgrid--content')
            }, DURATION)
        }, 'menu')
        .addLabel('content', 'menu+=0.4')
        .to(menuItems.map(item => item.DOM.el), {
            opacity: 0,
            onComplete: () => menu.classList.add('menu--hidden')
        }, 'content')
        .fromTo(menuItem.contentItem.DOM.titleChars, {
            xPercent: 100
        }, {
            stagger: 0.025,
            xPercent: 0
        }, 'content')
        .fromTo([menuItem.contentItem.DOM.description, menuItem.contentItem.DOM.backCtrl], {
            opacity: 0,
            yPercent: 100
        }, {
            opacity: 1,
            yPercent: 0
        }, 'content')
        .fromTo([menuItem.contentItem.DOM.nextThumb, menuItem.contentItem.DOM.prevThumb], {
            scale: 0.9,
            xPercent: pos => pos ? -30 : 30,
            opacity: 0
        }, {
            scale: 1,
            xPercent: 0,
            opacity: 1,
            
        }, 'content');
    });

    // Back to menu
    menuItem.contentItem.DOM.backCtrl.addEventListener('click', () => {
        if ( isAnimating ) return;
        
        isAnimating = true;
        mode = 'menu';

        const DURATION = 0.6;
        const EASE = 'expo';

        gsap
        .timeline({
            defaults: {
                duration: DURATION,
                ease: EASE
            },
            onComplete: () => {
                menuItem.contentItem.DOM.el.classList.remove('content--current');
                menu.classList.remove('menu--hidden');
                isAnimating = false;
            }
        })
        .addLabel('content', 0)
        .to([menuItem.contentItem.DOM.nextThumb, menuItem.contentItem.DOM.prevThumb], {
            scale: 0.9,
            xPercent: pos => pos ? -80 : 80,
            opacity: 0,
        }, 'content')
        .to([menuItem.contentItem.DOM.description, menuItem.contentItem.DOM.backCtrl], {
            opacity: 0,
            yPercent: -100
        }, 'content')
        .to(menuItem.contentItem.DOM.titleChars, {
            xPercent: 100
        }, 'content')
        .add(() => {
            // Show one image rather than the four together
            menuItem.contentItem.DOM.thumbgrid.classList.remove('thumbgrid--content')

            const thumbgridItems = menuItem.contentItem.DOM.thumbgrid.children;
            const flipstate = Flip.getState(menuItem.thumbGrid.DOM.items, {props: "transform,opacity"});
            
            [...thumbgridItems].forEach(item => {
                menuItem.thumbGrid.DOM.el.appendChild(item);
                gsap.set(item, {opacity: 0});
            });
            
            Flip.from(flipstate, {
                duration: DURATION,
                ease: EASE,
                scale: true,
                simple: true,
                prune: true
            })

        }, 'content')
        .addLabel('menu', 'content+=0.2')
        .to(menuItems.map(item => item.DOM.el), {
            opacity: 1
        }, 'menu')
        .to(menuItem.DOM.description, {
            yPercent: 0
        }, 'menu')
        .to(menuItem.DOM.titleChars, {
            xPercent: 0,
            stagger: -0.02
        }, 'menu')
        
    });

};

// Preload images then remove loader (loading class) from body
preloadImages('.thumb-next__inner').then(() => document.body.classList.remove('loading'));