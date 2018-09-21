// import {expect} from 'chai'
import {mount} from '@vue/test-utils'
import DragResize from '../src/component/zw-drag-resize'
import Vue from 'vue';

describe('zw-drag-resize.vue', () => {
    /***********
     * Generic *
     ***********/
    it('should render correctly', function () {
        const wrapper = mount(DragResize);
        const vm = wrapper.vm;
        expect(vm.$el).to.be.ok;
        expect(vm.$el.className).to.contain('vdr')
    });

    it('should render the elements in slot', function () {

        const wrapper = mount(DragResize, {
            slots: {
                default: '<p>Resize Me</p>'
            }
        });
        const vm = wrapper.vm;

        // console.log(wrapper.html())；  字符串
        // console.log(vm.$el); dom对象
        expect(vm.$el).to.have.class('vdr')
        // cannot fully match the child element because vue injects a data-v-* random attribute
        expect(vm.$el).to.contain.html('Resize Me</p>')
    });

    /****************************
     * Size and position prosps *
     ****************************/

    describe('Size and position props', function () {
        it('should set the size of the element through props', function () {
            const wrapper = mount(DragResize, {
                propsData: {
                    w: 600,
                    h: 500
                }
            });
            const vm = wrapper.vm;

            expect(vm.$el.style.width).to.equal('600px');
            expect(vm.$el.style.height).to.equal('500px');
        });

        it('should costrain minimum width and height', function (done) {
            const wrapper = mount(DragResize, {
                propsData: {
                    w: 100,
                    h: 100,
                    minw: 200,
                    minh: 200
                }
            });
            const vm = wrapper.vm;

            Vue.config.errorHandler = done
            Vue.nextTick(() => {
                expect(vm.$el.style.width).to.equal('200px');
                expect(vm.$el.style.height).to.equal('200px');
                done()
            })
        })

        it('should not exceed the size of parent element if constrained', function (done) {
            const ParentComponent = {
                template: `<div class="parent" style="width: 500px; height: 500px;">
          <drag-resize :w="600" :h="600" :parent="true">
            <p>Resize Me</p>
          </drag-resize>
        </div>`,
                components: {
                    DragResize
                }
            };

            const wrapper = mount(ParentComponent, {
                attachToDocument: true   //需要挂载到Dom上
            });
            const vm = wrapper.vm;

            Vue.config.errorHandler = done
            Vue.nextTick(function () {
                expect(vm.$children[0].style.width).to.equal('500px');
                expect(vm.$children[0].style.height).to.equal('500px');
                done()
            })
        })


        it('should emit resizing event when the component is mounted', function () {
            const resizing = sinon.spy();
            const wrapper = mount(DragResize, {
                propsData: {
                    x: 50, y: 50, h: 300, w: 300
                },
                listeners: {
                    resizing,
                }
            });
            expect(resizing.called).to.equal(true);
            expect(resizing.args[0][0]).to.eql({top: 50, left: 50, height: 300, width: 300});
        })

    });


    /***************
     * Active prop *
     ***************/
    describe('Active prop', function () {
        it('should enable the element through active prop', function () {
            const vm = mount(DragResize, {
                propsData: {
                    active: true
                }
            }).vm;

            expect(vm.$data.enabled).to.equal(true)
        })
    })

    /***************
     * zIndex prop *
     ***************/
    describe('zIndex prop', function () {
        it('should set the zIndex throug z prop', function () {
            const vm = mount(DragResize, {
                propsData: {
                    z: 99
                }
            }).vm;

            expect(vm.$el.style.zIndex).to.equal('99')
        })

        it('should set "auto" as defaul value for zIndex', function () {
            const vm = mount(DragResize).vm

            expect(vm.$el.style.zIndex).to.equal('auto')
        })

        it('should react to z prop changes', function () {
            const vm = mount(DragResize, {
                propsData: {
                    z: 99
                }
            }).vm;

            vm.z = 999

            vm.$forceUpdate();

            vm._watchers.forEach((watcher) => {
                if (watcher.expression === 'z') {
                    watcher.run()
                }
            });

            expect(vm.$data.zIndex).to.equal(999)
        })
    })

    /*******************
     * Clicking events *
     *******************/
    describe('Clicking events', function () {
        it('should activate the element by clicking on it', function () {
            const activated = sinon.spy()
            const update = sinon.spy()

            const wrapper = mount(DragResize, {
                listeners: {
                    activated,
                    'update:active': update
                },
            });

            const vm = wrapper.vm;

            wrapper.trigger('mousedown');

            expect(vm.$data.enabled).to.equal(true);

            sinon.assert.calledWith(activated);
            sinon.assert.calledWith(update);
        })

        it('should show the handles if the element is active', function (done) {
            const wrapper = mount(DragResize)
            const vm = wrapper.vm

            wrapper.trigger('mousedown')

            Vue.config.errorHandler = done;
            Vue.nextTick(function () {
                expect(vm.$el.querySelectorAll('div[style*="display: block"]')).to.have.length(8)
                done()
            })
        })

        it('should deactivate the element by clicking outside it', function () {
            const deactivated = sinon.spy()
            const update = sinon.spy()

            const wrapper = mount(DragResize, {
                listeners: {
                    deactivated,
                    'update:active': update
                }
            })
            const vm = wrapper.vm;

            wrapper.trigger('mousedown')
            expect(vm.$data.enabled).to.equal(true)

            const mouseDownEvent = new Event('mousedown');
            document.documentElement.dispatchEvent(mouseDownEvent);

            expect(vm.$data.enabled).to.equal(false)

            sinon.assert.calledWith(deactivated)
            sinon.assert.calledWith(update)
        })

        it('should emit "deactivated" event only once', function () {
            const deactivated = sinon.spy()

            const wrapper = mount(DragResize, {
                listeners:{
                    deactivated
                }
            });
            const vm = wrapper.vm

            // simulate(vm.$el, 'mousedown');
            wrapper.trigger('mousedown');

            const mouseDownEvent = new Event('mousedown');
            document.documentElement.dispatchEvent(mouseDownEvent);
            document.documentElement.dispatchEvent(mouseDownEvent);

            // simulate(document.documentElement, 'mousedown')
            // simulate(document.documentElement, 'mousedown')

            sinon.assert.calledOnce(deactivated)
        })
    })
    /*******************
     * Resizable props *
     *******************/

    describe('Resizable props', function () {
        it('should have "resizable" class by default', function () {
            const vm = mount(DragResize).vm
            expect(vm.$el.className).to.contain('resizable')
        })

        it('should not have "resizable" class if resizable is disabled', function () {
            const vm = mount(DragResize, {
                propsData:{
                    resizable: false
                }
            }).vm;
            expect(vm.$el.className).to.not.contain('resizable')
        })

        it('should render eight handles not visible by default', function () {
            const vm = mount(DragResize).vm
            expect(vm.$el.querySelectorAll('div.handle')).to.have.length(8)
            expect(vm.$el.querySelectorAll('div[style*="display:block"]')).to.have.length(0)
        })

        it('should not render handles if resizable is disabled', function () {
            const vm = mount(DragResize, {
                propsData:{
                    resizable: false
                }
            }).vm
            expect(vm.$el.querySelectorAll('div.handle')).to.have.length(0)
        })

        it('should render only the handles passed with props', function () {
            const vm = mount(DragResize, {
                propsData:{
                    handles: ['tl', 'tm', 'tr', 'bl', 'bm', 'br']
                }
            }).vm
            expect(vm.$el.querySelectorAll('div.handle')).to.have.length(6)
        })

        it('should not render the handles if handles props is empty', function () {
            const vm = mount(DragResize, {
                propsData:{
                    handles: []
                }
            }).vm
            expect(vm.$el.querySelectorAll('div.handle')).to.have.length(0)
        })
    })
});
