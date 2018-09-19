import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import DragResize from '../src/component/zw-drag-resize'

describe('zw-drag-resize.vue', () => {
    it('test', () => {
        const wrapper = mount(DragResize);
        expect(wrapper.contains('.vdr')).equal(true);
    })
});
