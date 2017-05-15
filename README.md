# pattern-lock

A bootstrap style pattern lock component. Responsive to both mouse and touch event.

## Install

Include jquery and pattern-lock.js in your html.

## Usage

### Via data attributes

Set `class="pattern-lock"` on a container element, along with options like `data-mode="validate"`, `data-min-length=5`.

```HTML
<div class="pattern-lock" data-mode="validate" data-min-length=5></div>
```

### Via Javascript

``` javascript
$('#lock').patternLock(options);
```

## Options

As in bootstrap, options can be passed via data attributes or JavaScript.

#### `mode`

Values: `set`(default) or `validate`

Whether the component is waiting for user to set a password or to validate.

#### `correctPassword`

Only useful when `mode` is set to `validate`, it determines the password to compare with.

#### `minLength`

Values: An interger between 0-9

The minimum length of a valid password.

#### `lineWidth`

Values: An Interger.

Width of the track line.

#### `lineColor`

Values: A css style color string

Color of the track line.

#### `defaultCircleColor`

Values: A css style color string

The stroke color of the circle by default.

#### `activatedCircleColor`

Values: A css style color string

The stroke color of the circle when activated.

#### `pointColor`

Values: A css style color string

The fill color of the circle when activated.

## Methods

#### `.patternLock('set')`

Set the component mode to 'set'.

#### `.patternLock('validate')`

Set the component mode to 'validate'.

#### `.patternLock('disable')`

Disable the component temporarily.

#### `.patternLock('enable')`

Enable the component again.

## Events

The component fires several events including:

#### short.patternLock

The event fires when the user set a too short password.

#### init.patternLock

The event fires after the user set a password for the first time.

#### diff.patternLock

The event fires after the user set a password different from the first one.

#### set.patternLock

The event fires after the user set a password successfully.

#### wrong.patternLock

The event fires when a validation is failed.

#### correct.patternLock

The event fires when user input a correct password.

You can listen to those events via
```javascript

$(document).on('wrong.patternLock', function (e) {
  // do something
})

```

## Example

#### general example

https://guochen-whu.github.io/pattern-lock/example/general/

#### set password

https://guochen-whu.github.io/pattern-lock/example/set/

#### validate password

https://guochen-whu.github.io/pattern-lock/example/validate/


