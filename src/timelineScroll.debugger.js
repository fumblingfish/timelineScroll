timelineScroll.debugger = (function () {
   'use strict';

   var pinBaseCss = {
      width:130,
      position:'absolute',
      right:0,
      borderTop:'1px dashed #fff',
      opacity:0.8
   }

   var cueBaseCss = {
      width:200,
      position:'absolute',
      right:0,
      opacity:1,
      background:'rgba(255,255,50,0.7',
      padding:5,
      overflow:'hidden',
   }

   var cueBaseTxtCss = {
      fontSize:10,
      padding:2,
      color:'#000'
   }

   var timelineArrow = {
      position:'fixed',
      left:0,
      right:0,
      height:1,
      opacity:0.8,
      top:20,
      background:'rgba(255,255,50,0.7'
   }

   return {
      injectPins: function ($scene, arr) {
         var $pin = $('<div/>').css(pinBaseCss)
         arr.forEach(function (point) {
            var $pinClone1 = $pin.clone()
            var $pinClone2 = $pin.clone()
            $pinClone1.css({
               top: point.y * 100 + '%',
            })
            $pinClone2.css({
               top: point.y * 100 + '%',
               borderTop: '1px dashed #000',
               right:4,
               width:124,
            })
            $scene.append($pinClone2)
            $scene.append($pinClone1)

         })
      },

      debugCuePoints: function (story, showProps, backgroundColor, color) {
         var $pin = $('<div/>').css(cueBaseCss)
         $pin.css({background:backgroundColor})
         var eachScene = function (scene) {
            var $sceneElement = scene.$sceneElement
            var cueTxt = $('<p/>').css(cueBaseTxtCss).css({color:color})
            scene.tweens.forEach(function (tween) {
               var cueTxtClone = cueTxt.clone().text(['from:', tween.from, 'to:', tween.to].join(' '))
               var propsTxtClone = cueTxt.clone().text(JSON.stringify(tween._baseProps))
               var $pinClone = $pin.clone()
               $pinClone.append(cueTxtClone)
               if(showProps) $pinClone.append(propsTxtClone)
               $pinClone.css({
                  top: tween.tweenPosition * 100 + '%',
                  height:tween.tweenDuration * 100 + '%'
               })
               $sceneElement.append($pinClone)
            })
            var $timelineArrow = $('<div/>').css(timelineArrow).css({
                  background:backgroundColor,
                  top:story.playheadRatio * 100 + '%'
               })
            $('body').append($timelineArrow)
         }
         story.scenes.forEach(eachScene)
      }
   }

})();


