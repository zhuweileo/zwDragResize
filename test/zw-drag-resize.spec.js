// import {expect} from 'chai'
import {mount} from '@vue/test-utils'
import DragResize from '../src/component/zw-drag-resize'
import Vue from 'vue';

describe('zw-drag-resize.vue', () => {
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

            const wrapper = mount(ParentComponent,{
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
            const wrapper = mount(DragResize,{
                propsData:{
                    x: 50,y:50, h:300, w:300
                },
                listeners:{
                    resizing,
                }
            });
            expect(resizing.called).to.equal(true);
            expect(resizing.args[0][0]).to.eql({top: 50,left: 50,height:300,width: 300});
        })

    });


    describe('Active prop', function () {
        it('should enable the element through active prop', function () {
            const vm = mount(DragResize, {
                propsData:{
                    active: true
                }
            }).vm;

            expect(vm.$data.enabled).to.equal(true)
        })
    })
});
