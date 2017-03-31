# pattern-lock

A bootstrap style pattern lock component. Responsive to both mouse and touch event.

## Install

Include jquery and pattern-lock.js in your html.

## Usage

### Via data attributes

Insert a `<canvas>` element in your html with `class="pattern-lock"` and other options `data-*=""`.

```HTML
<canvas class="pattern-lock" data-mode="validate"></canvas>
```

### Via Javascript

``` javascript
$('canvas').patternLock(options);
```

## Options

As in bootstrap, options can be passed via data attributes or JavaScript.

### `mode`

Values: `set`(default) or `validate`
Data-attribute: `data-mode`

Whether the component is waiting for user to set a password or to validate.

### `minLength`

Values: An interger between 0-9

Determine the minimum length of a valid password.

### `circleStrokeColor`

Values: A css style color string

Determine the stroke color of the circle.

### `circleFillColor`

Values: A css style color string

Determine the fill color of the circle.

### `lineWidth`

Values: An Interger.

Determine the width of line and circle stroke.

### `lineColor`

Values: A css style color string

Determine the track line color.

## Methods

`.patternLock('set')`

Set the component mode to 'set'.

`.patternLock('validate')`

Set the component mode to 'validate'.

`.patternLock('disable')`

Disable the component temporarily.

`.patternLock('enable')`

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

See Example folder.


