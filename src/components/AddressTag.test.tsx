import React from 'react';
import { shallow } from 'enzyme';
import AddressTag from './AddressTag';
describe('AddressTag', () => {
    it('should render correctly in "debug" mode', () => {
        const component = shallow(<AddressTag address={"0x123456"} />);
        expect(component).toMatchSnapshot();
    });
});
