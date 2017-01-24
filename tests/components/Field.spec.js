import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import { Form, Field, Input } from '../../dist/index';

describe('<Field /> Higher-Order-Component', () => {
  const nameField = { label: 'name', value: 'Test Name' };
  const emailField = { label: 'email', value: 'user@company.com' };

  describe('Default Field', () => {
    it('by default renders an `Input` component', () => {
      const wrapper = shallow(<Field />);
      expect(wrapper.find(Input)).to.have.length(1);
    });

    it('passes appropriate props down', () => {
      const propsToPass = Object.assign({}, nameField, { debounce: 300, required: true });

      const wrapper = mount(<Field {...propsToPass} />);

      const fields = wrapper.find(Field);
      expect(fields).to.have.length(1);

      const nameFieldProps = fields.first().props();

      expect(nameFieldProps).to.have.property('debounce', 300);
      expect(nameFieldProps).to.have.property('required', true);
      expect(nameFieldProps).to.have.property('value', nameField.value);
    });
  });

  describe('Custom Input', () => {
    let customInputConstructor;
    let customInputClass;

    before('Assemble a custom input element', () => {
      customInputConstructor = props => <div><h4>My Test Input!</h4><input value={props.value} onChange={props.onChange}/></div>;

      customInputClass = class extends React.Component {
        render() {
          return (<div> {customInputConstructor(this.props)} <h5>Class test!</h5></div>)
        }
      }
    });

    it('will wrap a custom form (constructor function) passed through `Input` prop', () => {
      const wrapper = mount(<Field Input={customInputConstructor} value={'value!'} />);

      expect(wrapper.find(Field)).to.have.length(1);
      expect(wrapper.find('h4')).to.have.length(1);
      expect(wrapper.find('h4').text()).to.equal('My Test Input!');
    });

    it('will wrap a custom form (React Component Subclass) passed through `Form` prop', () => {
      const wrapper = mount(<Field Input={customInputClass} value={'value!'} />);

      expect(wrapper.find(Field)).to.have.length(1);
      expect(wrapper.find('h4')).to.have.length(1);
      expect(wrapper.find('h4').text()).to.equal('My Test Input!');
      expect(wrapper.find('h5').text()).to.equal('Class test!');
    });


    it('passes `props` down to the custom `Input` component', () => {
      const _onChange = function(e) { console.log(e.target); }
      const _Field = <Field Input={customInputConstructor} value={'value!'} label="pass" value="123goodPass" onChange={_onChange} />;
      const wrapper = mount(_Field);

      expect(wrapper.find(Field)).to.have.length(1);
      expect(wrapper.find('h4')).to.have.length(1);
      expect(wrapper.find('h4').text()).to.equal('My Test Input!');

      const renderedCustomInput = wrapper.find(customInputConstructor);
      expect(renderedCustomInput).to.have.length(1);

      const renderedCustomInputProps = renderedCustomInput.props();

      expect(renderedCustomInputProps).to.have.property('Input', null);
      expect(renderedCustomInputProps).to.have.property('value', renderedCustomInputProps.value);
      expect(renderedCustomInputProps).to.have.property('label', renderedCustomInputProps.label);
      expect(renderedCustomInputProps).to.have.property('valid', renderedCustomInputProps.valid);
      expect(renderedCustomInputProps).to.have.property('pristine', renderedCustomInputProps.pristine);

      expect(renderedCustomInputProps).to.have.property('onChange');
      expect(typeof renderedCustomInputProps.onChange).to.eql('function');
    });
  });
});
