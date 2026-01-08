
export const M = {
    rotation: function (rotation) {
        return CanvasSupport.tRotationMatrix(rotation);
    },

    scaling: function (x, y) {
        return CanvasSupport.tScalingMatrix(x, y);
    },

    translation: function (x, y) {
        return CanvasSupport.tTranslationMatrix(x, y);
    },
};

export const V = {
    rotate: function (v, rotation) {
        return V.multiply(v, M.rotation(rotation));
    },

    add: function (v, u) {
        return [u[0] + v[0], u[1] + v[1]];
    },

    multiply: function (v, matrix) {
        return CanvasSupport.tMatrixMultiplyPoint(matrix, v[0], v[1]);
    },
};
