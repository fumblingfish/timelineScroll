var timelineScroll = (function ($, TweenMax) {
   'use strict';

   var $window = $(window)

   var defaultOptions = {
      playheadRatio: 0.5
   };

   var Storyline = function ElementStory(elm, options, callback) {
      this.options = $.extend(true, defaultOptions, options)
      this.$targetElement = $(elm)
      this.sceneCount = 0
      this.scenes = []
      this.startProps = null
      this.tl = new TimelineMax()
      this.onUpdateCallback = callback || function () {}
      this.playheadRatio = this.options.playheadRatio
      var sceneHeight = function (scene) {
         return scene.$sceneElement.outerHeight()
      }

      this.updateTimeline = function () {
         var tl = this.tl
         var $target = this.$targetElement
         var prevRatio = 0
         var storyHeight = this.storyHeight()
         tl.clear()
         tl.set($target, this.startProps)
         this.scenes.forEach(function (scene) {
            var tweens = scene.tweens
            var sH = sceneHeight(scene)
            var ratio = sH / storyHeight
            tweens.forEach(function (tween) {
               var rDuration = tween.tweenDuration * ratio
               tween.props.ease = tween.props.ease ? tween.props.ease : Linear.easeNone
               var rPosition = prevRatio + (tween.tweenPosition * ratio)
               tl.add(new TweenMax($target, rDuration, tween.props), rPosition)
            })
            prevRatio = ratio + prevRatio
         })
         tl.to($target, 0, {}, 1)
         tl.pause()
         this.update()
      }

      this.update = function () {
         var sh = this.storyHeight()
         var storyTop = this.storyTop()
         var windowTop = $window.scrollTop()
         var tY = $window.height() * this.playheadRatio
         var timelinePos = windowTop - storyTop + tY
         timelinePos = timelinePos < 0 ? 0 : timelinePos
         var ratio = timelinePos / sh
         this.tl.progress(ratio)
         this.onUpdateCallback()
      }
   }

   Storyline.prototype.storyHeight = function () {
      return this.scenes.reduce(function (acc, scene) {
         return acc + scene.$sceneElement.outerHeight()
      }, 0)
   }

   Storyline.prototype.storyTop = function () {
      var sceneOffsetTops = this.scenes.map(function (scene) {
         return scene.$sceneElement.offset().top
      })
      return Math.min.apply(null, sceneOffsetTops)
   }

   Storyline.prototype.updateResize = function () {
      this.updateTimeline()
   }

   Storyline.prototype.updateScroll = function () {
      this.update()
   }

   Storyline.prototype.addScene = function (elm) {
      if(typeof this.storylineBegin === 'undefined') throw new Error('storyline should call start before adding scenes')
      var scene = new Scene(elm, this.sceneCount)
      this.scenes.push(scene)
      this.sceneCount++
      return scene
   }

   Storyline.prototype.start = function (props) {
      this.startProps = props || {}
      this.storylineBegin = true
   }

   Storyline.prototype.end = function () {
      if (!this._cuepointValidation()) {
         throw new Error('cuepoints should be monotonically increasing')
      }
      if (!this._lastTweenValidation()) {
         throw new Error('last tween must be less than or equal to 1')
      }
      this.updateTimeline()
   }

   Storyline.prototype._cuepointValidation = function () {
      var sceneCuepoints = this.scenes.reduce(function (acc, scene) {
         var tp = scene.timePosition
         var tweenCuepoints = scene.tweens.map(function (tween) {
            return [].concat([tween.from + tp, tween.to + tp])
         })
         return [].concat(acc, tweenCuepoints)
      }, [])
      var mergedScenes = flatten(sceneCuepoints);
      var timelineIncrements = mergedScenes.reduce(function (acc, next) {
         if (acc > next) return false
         if (acc === false) return false
         return next
      }, 0)
      return timelineIncrements !== false
   }

   Storyline.prototype._lastTweenValidation = function () {
      var lastScene = this.scenes[this.scenes.length - 1]
      var lastTween = lastScene.tweens[lastScene.tweens.length - 1]
      return lastTween.to <= 1.0
   }

   var Tween = function (from, to, props) {
      this.from = from
      this.to = to
      this.tweenPosition = from
      this.tweenDuration = to - from
      this.props = props
      this._baseProps = $.extend(true, {}, props)
   }

   var Scene = function Scene(elm, timePos) {
      this.$sceneElement = $(elm)
      this.tweens = []
      this.timePosition = timePos
   }

   Scene.prototype.addTween = function (from, to, tweenProps) {
      this.tweens.push(new Tween(from, to, tweenProps, this.timePosition))
      return this
   }

   function flatten(arr) {
      return [].concat.apply([], arr)
   }

   return {
      createStoryline: function (elm, options, callback) {
         return new Storyline(elm, options, callback)
      }
   }

})(jQuery, TweenMax);


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


