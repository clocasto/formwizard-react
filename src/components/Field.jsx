import React from 'react';
import debounce from 'lodash.debounce';
import {
  assembleValidators,
  isValid,
  updateValidators,
  mapPropsToChild,
  makePropsForStatus,
} from '../helpers/utilities';

const Field = class extends React.Component {
  constructor(props) {
    super(props);

    const validators = assembleValidators(props);

    this.state = {
      validators,
      value: props.value,
      valid: isValid(props.value, validators),
      pristine: true,
      debounce: Math.floor(Math.pow(Math.pow(+props.debounce, 2), 0.5)) || 0, //eslint-disable-line
    };
    this.finalValue = null;

    this.onChange = this.onChange.bind(this);
    this.broadcastChange = this.broadcastChange.bind(this);
    this.cancelBroadcast = this.cancelBroadcast.bind(this);
    this.debouncedBroadcastChange = this.state.debounce ?
      debounce(this.broadcastChange, this.state.debounce) : this.broadcastChange;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.passedValue !== this.props.passedValue) {
      this.cancelBroadcast(nextProps.passedValue);
      this.setState({
        value: nextProps.passedValue,
        valid: isValid(nextProps.passedValue, this.state.validators),
      }, this.debouncedBroadcastChange);
    } else if (nextProps.value !== this.props.value && nextProps.value !== this.state.value) {
      this.cancelBroadcast(nextProps.value);
      this.setState({
        value: nextProps.value,
        valid: isValid(nextProps.value, this.state.validators),
      });
    }

    if (this.props.match !== nextProps.match) {
      const validators = updateValidators({ match: nextProps.match }, this.state.validators);
      this.setState({ valid: isValid(this.state.value, validators), validators });
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.passedValue !== this.props.passedValue) return true;
    if (nextProps.value !== this.state.value) return true;
    if (this.state.value !== this.finalValue) return true;
    if (this.props.match !== nextProps.match) return true;
    return false;
  }

  componentWillUnmount() {
    this.broadcastChange();
    this.cancelBroadcast();
  }

  onChange(e) {
    const value = e.target.value;
    this.finalValue = value;

    this.setState({
      value,
      valid: isValid(value, this.state.validators),
      pristine: false,
    }, this.debouncedBroadcastChange);
  }

  broadcastChange() {
    if (this.props.onChange) {
      this.props.onChange({
        name: this.props.name,
        value: this.state.value,
        valid: this.state.valid,
        pristine: this.state.pristine,
      });
    }
  }

  cancelBroadcast(newFinalValue = null) {
    if (this.debouncedBroadcastChange.cancel) {
      this.debouncedBroadcastChange.cancel();
    }
    this.finalValue = newFinalValue;
  }

  render() {
    const childCount = React.Children.count(this.props.children);
    const inputProps = {
      name: this.props.name,
      value: this.state.value,
      type: this.props.type,
      onChange: this.onChange,
      onFocus: this.props.onFocus,
      onBlur: this.props.onBlur,
    };

    if (!childCount) {
      return (
        <div>
          <label htmlFor={this.props.name}>
            <input {...inputProps} />
          </label>
        </div>
      );
    }
    return (
      <div>
        {React.Children
          .map(this.props.children, child => mapPropsToChild(child, {
            input: () => inputProps,
            valid: () => makePropsForStatus('valid', { [this.props.name]: { valid: this.state.valid } }),
            pristine: () => makePropsForStatus('pristine', {
              [this.props.name]: { pristine: this.state.pristine },
            }),
          }))}
      </div>
    );
  }
};

Field.propTypes = {
  value: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  passedValue: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  name: React.PropTypes.string,
  onChange: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  debounce: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
  match: React.PropTypes.any, // eslint-disable-line
  children: React.PropTypes.oneOfType([
    React.PropTypes.element,
    React.PropTypes.arrayOf(React.PropTypes.element),
    React.PropTypes.object,
  ]),
  type: React.PropTypes.string,
};

Field.defaultProps = {
  value: '',
  passedValue: '',
  name: '',
  onChange: undefined,
  onFocus: undefined,
  onBlur: undefined,
  debounce: 0,
  match: undefined,
  children: [],
  type: 'text',
};

export default Field;
