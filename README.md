# timelineScroll
A scroll animation helper that uses gsap and jQuery


## Usage

```
var storyline = timelineScroll.createStoryline($target, {playheadRatio:0.5})

storyline.start({left: '0%'})

storyline.addScene($('.sceneA'))
        .addTween(0.3, 0.5, {left: '10%'})
        .addTween(0.8, 1.0, {left: '20%'})

storyline.addScene($('.sceneB'))
        .addTween(0.2, 0.4, {left: '40%'})

storyline.addScene($('.sceneC'))
        .addTween(0.2, 0.4, {left: '50%'})
        .addTween(0.6, 0.8, {left: '60%'})

storyline.addScene($('.sceneD'))
        .addTween(0.0, 0.2, {left: '20%'})
        .addTween(0.6, 0.8, {left: '0%'})

storyline.end()

var resizeHandler = function () {
    storyline.updateResize()
}

var scrollHandler = function () {
    storyline.updateScroll()
}

window.addEventListener('scroll', scrollHandler)
window.addEventListener('resize', resizeHandler)
```