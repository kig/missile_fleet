/**
  Delete the first instance of obj from the array.

  @param obj The object to delete
  @return true on success, false if array contains no instances of obj
  @type boolean
  @addon
  */
Array.prototype.deleteFirst = function (obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == obj) {
            this.splice(i, 1);
            return true;
        }
    }
    return false;
};

Array.prototype.stableSort = function (cmp) {
    // hack to work around Chrome's qsort
    for (var i = 0; i < this.length; i++) {
        this[i].__arrayPos = i;
    }
    return this.sort(Array.__stableSorter(cmp));
};
Array.__stableSorter = function (cmp) {
    return function (c1, c2) {
        var r = cmp(c1, c2);
        if (!r) {
            // hack to work around Chrome's qsort
            return c1.__arrayPos - c2.__arrayPos;
        }
        return r;
    };
};

/**
  Compares two arrays for equality. Returns true if the arrays are equal.
  */
Array.prototype.equals = function (array) {
    if (!array) return false;
    if (this.length != array.length) return false;
    for (var i = 0; i < this.length; i++) {
        var a = this[i];
        var b = array[i];
        if (a.equals && typeof a.equals == "function") {
            if (!a.equals(b)) return false;
        } else if (a != b) {
            return false;
        }
    }
    return true;
};

/**
  Rotates the first element of an array to be the last element.
  Rotates last element to be the first element when backToFront is true.

  @param {boolean} backToFront Whether to move the last element to the front or not
  @return The last element when backToFront is false, the first element when backToFront is true
  @addon
  */
Array.prototype.rotate = function (backToFront) {
    if (backToFront) {
        this.unshift(this.pop());
        return this[0];
    } else {
        this.push(this.shift());
        return this[this.length - 1];
    }
};
/**
  Returns a random element from the array.

  @return A random element
  @addon
 */
Array.prototype.pick = function () {
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.flatten = function () {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var e = this[i];
        if (e.flatten) {
            var ef = e.flatten();
            for (var j = 0; j < ef.length; j++) {
                a[a.length] = ef[j];
            }
        } else {
            a[a.length] = e;
        }
    }
    return a;
};

Array.prototype.take = function () {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var e = [];
        for (var j = 0; j < arguments.length; j++) {
            e[j] = this[i][arguments[j]];
        }
        a[i] = e;
    }
    return a;
};

if (!Array.prototype.pluck) {
    Array.prototype.pluck = function (key) {
        var a = [];
        for (var i = 0; i < this.length; i++) {
            a[i] = this[i][key];
        }
        return a;
    };
}

Array.prototype.set = function (key, value) {
    for (var i = 0; i < this.length; i++) {
        this[i][key] = value;
    }
};

Array.prototype.allWith = function () {
    var a = [];
    topLoop: for (var i = 0; i < this.length; i++) {
        var e = this[i];
        for (var j = 0; j < arguments.length; j++) {
            if (!this[i][arguments[j]]) continue topLoop;
        }
        a[a.length] = e;
    }
    return a;
};

if (!Array.prototype.last) {
    /**
    Returns the last element of the array.

    @return The last element of the array
    @addon
    */
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}
