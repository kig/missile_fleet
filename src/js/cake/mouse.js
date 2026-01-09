
if (!window.Mouse) window.Mouse = {}
/**
  Returns the coordinates for a mouse event relative to element.
  Element must be the target for the event.

  @param element The element to compare against
  @param event The mouse event
  @return An object of form {x: relative_x, y: relative_y}
  */
Mouse.getRelativeCoords = function(element, event) {
  var xy = {x:0, y:0};
  const bbox = element.getBoundingClientRect();
  xy.x = event.clientX - bbox.left;
  xy.y = event.clientY - bbox.top;
  return xy;
}

Mouse.LEFT = 0
Mouse.MIDDLE = 1
Mouse.RIGHT = 2
