(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
		typeof define === 'function' && define.amd ? define(factory) :
			(global.mergeImages = factory());
}(this, (function () {
	'use strict';

	// Defaults
	var defaultOptions = {
		format: 'image/jpeg',
		quality: 0.92,
		width: undefined,
		height: undefined,
		Canvas: undefined,
		crossOrigin: undefined,
		nameText: 'test',
		formData: 'test'
	};

	// Return Promise
	var mergeImages = function (sources, options) {
		if (sources === void 0) sources = [];
		if (options === void 0) options = {};

		return new Promise(function (resolve) {
			options = Object.assign({}, defaultOptions, options);

			// Setup browser/Node.js specific variables
			var canvas = options.Canvas ? new options.Canvas() : window.document.createElement('canvas');
			var Image = options.Image || window.Image;

			// Load sources
			var images = sources.map(function (source) {
				return new Promise(function (resolve, reject) {
					// Convert sources to objects
					if (source.constructor.name !== 'Object') {
						source = { src: source };
					}

					// Resolve source and img when loaded
					var img = new Image();
					img.crossOrigin = options.crossOrigin;
					img.onerror = function () { return reject(new Error('Couldn\'t load image')); };
					img.onload = function () { return resolve(Object.assign({}, source, { img: img })); };
					img.src = source.src;
				});
			});

			// Get canvas context
			var ctx = canvas.getContext('2d');

			// When sources have loaded
			resolve(Promise.all(images)
				.then(function (images) {
					// Set canvas dimensions
					var getSize = function (dim) { return options[dim] || Math.max.apply(Math, images.map(function (image) { return image.img[dim]; })); };
					canvas.width = getSize('width');
					canvas.height = getSize('height');

					// Draw images to canvas
					images.forEach(function (image) {
						ctx.globalAlpha = image.opacity ? image.opacity : 1;
						return ctx.drawImage(image.img, image.x || 0, image.y || 0);
					});

					if (options.Canvas && options.format === 'image/jpeg') {
						// Resolve data URI for node-canvas jpeg async
						return new Promise(function (resolve, reject) {
							canvas.toDataURL(options.format, {
								quality: options.quality,
								progressive: false
							}, function (err, jpeg) {
								if (err) {
									reject(err);
									return;
								}
								resolve(jpeg);
							});
						});
					}

					// Time
					ctx.font = "25px baloo";
					ctx.fillStyle = "#990a17";
					var textString = options.formData.get('time'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					// ctx.textAlign = "center";
					ctx.fillText(textString , 460 , 1160);
					
					// Date
					ctx.font = "25px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('date'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "right";
					ctx.fillText(textString , 430 , 1160);
					
					// Yajman
					ctx.font = "30px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('yajman'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "center";
					ctx.fillText(textString , 440 , 1325);

					// Yajman 2
					ctx.font = "30px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('yajman2'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "center";
					ctx.fillText(textString , 440 , 1365);

					// Address 1
					ctx.font = "20px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('address'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "center";
					ctx.fillText(textString , 440 , 1405);

					// Address 1
					ctx.font = "20px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('address2'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "center";
					ctx.fillText(textString , 440 , 1435);
					
					// nondh
					ctx.font = "30px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('nondh'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "center";
					ctx.fillText(textString , 440 , 1500);

					// audience
					ctx.font = "25px baloo";
					ctx.fillStyle = "#000000";
					var textString = options.formData.get('audience'),
					textWidth = ctx.measureText(textString).width;
					// ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 450); //center text
					ctx.textAlign = "center";
					ctx.fillText(textString , 440 , 1575);

					// Resolve all other data URIs sync
					return canvas.toDataURL(options.format, options.quality);
				}));
				
		});
	
	};

	return mergeImages;

})));
//# sourceMappingURL=index.umd.js.map
