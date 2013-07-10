/** Based on THREEx.Screenshot.js  */
var THREEx	= THREEx 		|| {};

(function(){

	var _aspectResize	= function(srcUrl, dstW, dstH, callback){

		var cpuScaleAspect	= function(maxW, maxH, curW, curH){
			var ratio	= curH / curW;

            if (curW > curH) {
                curH = maxH;
                curW = curH / ratio;
            } else {
                curW = maxW;
                curH = curW * ratio;
            }

			return { width: curW, height: curH };
		}

		var onLoad	= function(){

			var canvas	= document.createElement('canvas');
			canvas.width	= dstW;	canvas.height	= dstH;
			var ctx		= canvas.getContext('2d');

			var scaled	= cpuScaleAspect(canvas.width, canvas.height, image.width, image.height);

			var offsetX	= (canvas.width  - scaled.width )/2;
			var offsetY	= (canvas.height - scaled.height)/2;
			ctx.drawImage(image, offsetX, offsetY, scaled.width, scaled.height);

			var mimetype	= mimetype;
			var newDataUrl	= canvas.toDataURL("image/png");

			callback && callback(newDataUrl)
		}.bind(this);

		var image 	= new Image();
		image.onload	= onLoad;
		image.src	= srcUrl;
	}


	var take = function(renderer, mimetype, width, height, callback){
		callback	= callback	|| function(url){
			console.log(url);
		};

        var dataUrl	= renderer.domElement.toDataURL("image/png");
        if( width === undefined && height === undefined ){
            callback( dataUrl )
        } else {
            _aspectResize(dataUrl, width, height, callback);
        }
	}

	THREEx.Screenshot	= {
        take : take
	};
})();
